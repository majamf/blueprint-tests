# Implementation Plan: ALME GitHub Actions Workflow

**Branch**: `MER-2426-INNOVATION-Blueprint-UI-tests` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-alme-workflow/spec.md`

## Summary

Create `.github/workflows/alme-playwright.yml` — a dedicated GitHub Actions workflow that runs
`tests/app-lifecycle-management/` via the existing `reusable-playwright-setup.yml`. Supports
`workflow_dispatch` (with optional `jamfProBaseUrl`, `filter`, `test_folder`, `rp_project`),
nightly schedule, and push to main. Slack channel (`mercury-alerts`), notify flags, and
matrix are hardcoded — no RP reporting by default.

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow syntax)
**Primary Dependencies**: `.github/workflows/reusable-playwright-setup.yml` (existing, unchanged)
**Storage**: N/A
**Testing**: YAML lint via GitHub Actions validation; functional test by triggering the workflow
**Target Platform**: GitHub Actions (self-hosted runner `jamf-ubuntu-latest`)
**Project Type**: CI/CD workflow configuration
**Performance Goals**: Workflow completes within 60 minutes (matches reusable workflow timeout)
**Constraints**: Must not modify `reusable-playwright-setup.yml`; must use existing secrets
**Scale/Scope**: Single workflow file, single test folder

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test Isolation & Self-Cleanup | ✅ Pass | Not applicable — workflow config, not a test file |
| II. Page-Object Step Pattern | ✅ Pass | Not applicable — workflow config |
| III. Mandatory Tagging | ✅ Pass | `smoke-mercury-jpro.spec.ts` already has `@chrome @stage @pro` |
| IV. Custom Fixture Import | ✅ Pass | Not applicable — workflow config |
| V. Zero Tolerance for Silent Flakiness | ✅ Pass | Not applicable — workflow config |
| CI & Reporting: test folder placement | ✅ Pass | Spec is in `tests/app-lifecycle-management/` |
| CI & Reporting: runner requirements | ✅ Pass | Uses `ubuntu-latest` self-hosted runner; no macOS runner |
| ALME Prerequisites | ✅ Pass | Environmental assumption documented in spec; out of workflow scope |

No gate violations. Proceed.

## Project Structure

### Documentation (this feature)

```text
specs/001-alme-workflow/
├── plan.md              # This file
├── research.md          # Phase 0 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
.github/workflows/
└── alme-playwright.yml  # New file — only deliverable
```

No existing files are modified.

## Phase 0: Research

See [research.md](./research.md) for full findings. Summary:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| `jamfProBaseUrl` | Optional dispatch input; falls back to stage env var | Manual runs pass URL explicitly; push/schedule use env var |
| Schedule cron | `0 8 * * *` (08:00 UTC) | Offset from `0 6` (playwright.yml) and `0 7` (goldminers) to avoid runner contention |
| Slack channel | Hardcoded `mercury-alerts` | Not a dispatch parameter; always notifies Mercury team channel |
| notify_success / notify_failure | Hardcoded `false` / `true` | Not dispatch parameters; conservative defaults |
| RP reporting | Disabled by default; opt-in via `rp_project` dispatch input | No RP noise on routine runs; enabled explicitly when needed |
| Matrix | None — single direct call to reusable workflow | Simpler than goldminers pattern; only one target environment |
| push-to-main trigger | Included with `@stage` filter | Consistent with existing workflows |
| pull_request trigger | Excluded | ALME tests require enrolled Mac; not safe to run on every PR |

### Key finding: `jamfProBaseUrl` is optional

`jamfProBaseUrl` is an optional `workflow_dispatch` input. For manual runs the user provides it
explicitly; for `push` and `schedule` triggers it is empty and the reusable workflow falls back
to the stage environment variables (`JAMF_PRO_DEVELOP_STAGE_BASE_URL`, etc.).

## Phase 1: Design

### Workflow structure

The new workflow mirrors `goldminers-playwright.yml` exactly, with these substitutions:

| Parameter | goldminers value | alme value |
|-----------|-----------------|------------|
| `name` | `Playwright Tests - Goldminers` | `Playwright Tests - ALME` |
| `schedule cron` | `0 7 * * *` | `0 8 * * *` |
| `pull_request` trigger | present | **absent** (enrolled Mac requirement) |
| `test_folder` default | `configuration-profiles` | `app-lifecycle-management` |
| `slack_channel` | dispatch input, default `gm-tests` | hardcoded `mercury-alerts` |
| `notify_success` | dispatch input, default `false` | hardcoded `false` |
| `notify_failure` | dispatch input, default `true` | hardcoded `true` |
| `rp_project` | dispatch input, default `jamf_shared` | dispatch input, default empty (no RP) |
| RP attributes | `team:goldminers,env:stage` | empty by default |
| Matrix | yes (setup job + matrix) | **no matrix** — single direct call |
| `jamfProBaseUrl` | optional | optional (env-var fallback for push/schedule) |

### `jamfProBaseUrl` optional input

`jamfProBaseUrl` is an optional dispatch input. When provided it is passed through to the
reusable workflow as `JAMF_PRO_CUSTOM_BASE_URL`; when omitted the reusable workflow uses the
stage env var configured in the runner environment.

### No `pull_request` trigger

Unlike `playwright.yml` and `goldminers-playwright.yml`, this workflow omits the
`pull_request` trigger entirely. ALME tests depend on an enrolled, supervised Mac being
reachable from the runner; that prerequisite cannot be guaranteed on every PR.

### Deliverable

Single file: `.github/workflows/alme-playwright.yml`

See [quickstart.md](./quickstart.md) for the exact file content and verification steps.
