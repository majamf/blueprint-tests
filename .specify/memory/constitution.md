<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.1.1
Modified principles: N/A
Added sections:
  - CI & Reporting Standards: macOS runner requirement for ALME and other
    platform-sensitive flows
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
  - .specify/templates/commands/*.md — no command files found; skipped silently
Follow-up TODOs: None.
-->

# blueprint-tests Constitution

## Core Principles

### I. Test Isolation & Self-Cleanup (NON-NEGOTIABLE)

Every test MUST be fully independent and leave no trace in the target system after it runs.

- Tests MUST generate unique names using `uuidv4()` and reset the id in `beforeEach`.
- Tests that create resources (blueprints, configurations) MUST delete them at the end of the test,
  including on failure paths where feasible.
- Tests MUST NOT depend on pre-existing test data created by another test or a previous run.
- Shared read-only fixtures (e.g., existing group names used for scoping) are acceptable but MUST
  be documented as environmental assumptions.

**Rationale**: Non-isolated tests produce random failures depending on execution order and leave
pollution that causes unrelated tests to fail in subsequent runs.

### II. Page-Object Step Pattern (NON-NEGOTIABLE)

All UI interactions MUST be encapsulated in step classes under `tests/steps/`, and every public
method MUST be decorated with `@Step('...')`.

- Spec files MUST only call step-class methods; raw Playwright API calls (`page.click()`,
  `page.fill()`, etc.) are forbidden in `.spec.ts` files.
- Step classes MUST be instantiated inside the test callback, passing `page`.
- Step title strings MUST be human-readable and describe the actor + action (e.g.,
  `'Admin opens blueprint with name "$0"'`).
- `@Step` placeholders (`$0`, `$1`, …) MUST correspond to the method's positional arguments.

**Rationale**: Named steps appear in Playwright traces and Report Portal, enabling engineers to
diagnose failures without reading source code. Raw calls in specs break that contract.

### III. Mandatory Tagging (NON-NEGOTIABLE)

Every test MUST include at least one tag from each of the three mandatory groups below, or it will
never execute in any CI project.

| Group       | Valid tags                                        |
| ----------- | ------------------------------------------------- |
| Host        | `@school`, `@pro`, `@pro-legacy`, `@standalone`   |
| Environment | `@sbox`, `@dev`, `@stage`, `@prod`                |
| Browser     | `@chrome`, `@firefox`, `@safari`, `@all-browsers` |

Informational tags (`@mimic`, `@component=<name>`, `@scenario_owner=<team>`) SHOULD be included
for observability but have no effect on execution routing.

**Rationale**: The `generateProjects()` mechanism routes tests to the correct Playwright project
via grep filters built from these tags. A missing mandatory tag silently excludes the test from all
runs.

### IV. Custom Fixture Import

Tests MUST import `test` from `tests/utils/utils` — never directly from `@playwright/test`.

- The custom `test` fixture provides `accountCredentials` and `apiCredentials` options populated
  by `playwright.config.ts` per environment.
- API step classes (`JProApiSteps`, `JSchoolApiSteps`) MUST receive `baseURL` and `apiCredentials`
  from the test fixture, not from module-level constants.

**Rationale**: Importing from `@playwright/test` bypasses the custom fixture, causing
`accountCredentials` and `apiCredentials` to be `undefined` at runtime.

### V. Zero Tolerance for Silent Flakiness

Tests that are known to fail non-deterministically on specific browsers or environments MUST be
annotated with `test.fixme(condition, 'link-to-ticket')` rather than left to retry silently.

- A test that passes only on retry without a `test.fixme` annotation is a hidden flaky test.
- Flaky tests MUST be triaged within the sprint they are discovered.
- `test.fixme` is a quarantine mechanism, not a long-term solution: tickets MUST be filed and
  the annotation MUST reference the ticket URL.

**Rationale**: Untracked retries erode confidence in the test suite. Explicit quarantine with a
ticket creates accountability for fixing root causes.

## Test Data Management

- Use `uuidv4()` from the `uuid` package for all unique identifiers embedded in resource names.
- The id variable MUST be declared at module scope and reset in `beforeEach` so each test gets a
  fresh value even under retries.
- Blueprint names MUST follow the pattern `<FeaturePrefix>_<uuid-fragment>` (e.g.,
  `Passcode_<uuid>`) so failures are attributable to specific test runs in logs.
- Cleanup (`adminDeletesBlueprint`, equivalent API teardown) MUST be the final step of a test,
  executed unconditionally (use `test.afterEach` for teardown when the happy-path assertion
  precedes cleanup).
- The `cleanup/` Deno project handles nightly stale-data removal and is independent of the
  Playwright suite; do not rely on it for per-test cleanup.

## CI & Reporting Standards

- All tests MUST pass `pnpm lint` (0 warnings) and `pnpm tsc:check` before a PR is merged.
- CI runs on GitHub Actions with `workers: 3` and 2 retries; a test that requires more than 2
  retries to pass reliably MUST be marked `test.fixme` pending investigation.
- The `@reportportal/agent-js-playwright` reporter is enabled only when `CI=true`; local runs
  default to the HTML reporter and do not push results.
- Every new spec file MUST be added to the appropriate directory:
  - `tests/core-blueprints/` — Blueprint create / edit / delete flows
  - `tests/configuration-profiles/` — Configuration Profile / Goldminers flows
  - `tests/app-lifecycle-management/` — ALME flows
- Step-class files belong in `tests/steps/`; no step logic is permitted inside spec files.

### Runner Requirements

- The default CI runner is `ubuntu-latest`; no macOS GitHub Actions runner is required.
- Tests that need to verify macOS-side behaviour (e.g. ALME flows that confirm files, profiles,
  or apps on a managed Mac) MUST do so by connecting to a real Mac device over SSH or a similar
  remote-execution mechanism — not by switching the GHA runner to macOS.
- The SSH/remote connection details (host, credentials) MUST be supplied via environment
  variables or CI secrets, following the same `.env` / `playwright.config.ts` pattern used for
  all other environment credentials.
- Verification steps that execute remote commands MUST be encapsulated in a step class under
  `tests/steps/` and decorated with `@Step`, like all other interactions.

## Governance

This constitution is the authoritative standard for all test-authoring decisions in the
`blueprint-tests` repository. It supersedes informal conventions, PR comments, and personal
preferences.

**Amendment procedure**:
1. Open a PR that modifies `.specify/memory/constitution.md`.
2. Bump `CONSTITUTION_VERSION` according to semantic versioning (see below).
3. Update `LAST_AMENDED_DATE` to the amendment date in ISO format.
4. Note the changes in the Sync Impact Report comment at the top of this file.
5. Obtain approval from at least one other team member before merging.

**Versioning policy**:
- MAJOR: Removal or fundamental redefinition of an existing principle.
- MINOR: New principle or section added; material expansion of guidance.
- PATCH: Clarification, wording improvement, typo fix, non-semantic refinement.

**Compliance review**: Every PR introducing new spec or step files MUST verify compliance with
Principles I–V before approval. Reviewers MUST check that mandatory tags, step decorators, and
cleanup steps are present.

**Version**: 1.1.1 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-04-15
