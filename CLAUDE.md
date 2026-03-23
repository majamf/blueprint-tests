# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are a Playwright specialist familiar with Jamf Pro. Your primary task is writing Playwright UI tests for Jamf Pro and Jamf School Blueprint features.

## Commands

```sh
pnpm install           # install dependencies
pnpm lint              # ESLint across tests/ (0 warnings tolerated)
pnpm format:check      # Prettier check
pnpm format            # Prettier write
pnpm tsc:check         # TypeScript type-check (no emit)

pnpm playwright test                                                     # run all tests
pnpm playwright test tests/core-blueprints/smoke-ocean-jschool.spec.ts  # run a single spec
pnpm playwright test --grep "@school"                                    # filter by tag
```

## Architecture

This is a **Playwright E2E test suite** for Jamf Blueprint features. Tests run against three host applications — Jamf School, Jamf Pro, and a standalone Blueprint mFE — across dev/stage/prod environments.

### Directory layout

| Path                              | Purpose                                                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/utils/utils.ts`            | Custom `test` fixture extending Playwright base; exports `accountCredentials` / `apiCredentials` fixture options and the `@Step()` method decorator |
| `tests/utils/environments.ts`     | Builds typed `environments` object from `.env` variables; used by `playwright.config.ts` to populate projects                                       |
| `tests/api/`                      | Thin API clients (`JSchoolClient`, `JProClient`, `MimicClient`) using Playwright's `request.newContext()`                                           |
| `tests/steps/`                    | Page-object-style step classes; every public method is decorated with `@Step('...')` to appear as a named step in traces and Report Portal          |
| `tests/core-blueprints/`          | Spec files for core Blueprint flows (create, edit, delete) on Jamf School and Jamf Pro                                                              |
| `tests/configuration-profiles/`   | Spec files for Configuration Profiles / Goldminers flows                                                                                            |
| `tests/app-lifecycle-management/` | Spec files for ALME flows                                                                                                                           |
| `cleanup/`                        | Separate **Deno** project (`deno task cleanup`) for nightly test-data cleanup — not Playwright                                                      |

### Project generation

`playwright.config.ts` calls `generateProjects()` which dynamically creates Playwright projects by combining browser (Chrome/Firefox/Safari), host (Jamf School, Jamf Pro develop/RC/GA/GA-1/GA-2, Standalone), and environment (sbox/dev/stage/prod/custom). Projects are selected at runtime via `grep` filters built from test tags.

### Test tagging

Every test **must** include at least one tag from each mandatory group or it will not run in any project:

| Group       | Tags                                              |
| ----------- | ------------------------------------------------- |
| Host        | `@school`, `@pro`, `@pro-legacy`, `@standalone`   |
| Environment | `@sbox`, `@dev`, `@stage`, `@prod`                |
| Browser     | `@chrome`, `@firefox`, `@safari`, `@all-browsers` |

Informational-only tags (no effect on execution): `@mimic`, `@component=<name>`, `@scenario_owner=<team>`.

### Writing tests

- Import `test` from `tests/utils/utils` (not directly from `@playwright/test`) to get the custom fixtures.
- Instantiate step classes inside the test callback, passing `page`.
- Use `uuidv4()` for unique test-data names; reset the id in `beforeEach`.
- API step classes (`JProApiSteps`, `JSchoolApiSteps`) accept `baseURL` and `apiCredentials` from the test fixture.

### Environment setup

Copy `.env.example` to `.env` and fill in credentials. An environment is activated when its `_BASE_URL` variable is set; missing credentials for an active environment throw at startup.

### CI

GitHub Actions workflows in `.github/workflows/` run on push/PR and on a daily schedule. CI sets `workers: 3`, enables 2 retries, and reports to Report Portal and a JSON artifact. The `@reportportal/agent-js-playwright` reporter is only active when `CI=true`.
