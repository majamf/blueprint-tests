# Implementation Plan: ALME GitHub Actions Workflow

**Branch**: `MER-2426-INNOVATION-Blueprint-UI-tests` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-alme-workflow/spec.md`

## Summary

Create `.github/workflows/alme-playwright.yml` — a dedicated GitHub Actions workflow that runs
`tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts` via the existing
`reusable-playwright-setup.yml`, with `jamfProBaseUrl` as a required `workflow_dispatch` input,
a nightly schedule, and Slack/Report Portal reporting matching the Mercury team's setup.

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
| Required input enforcement | `required: true` on `jamfProBaseUrl` input | GitHub Actions natively supports this; workflow fails fast if omitted |
| Fallback URL | None | Per spec FR-003: no fallback; URL is always explicit |
| Schedule cron | `0 8 * * *` (08:00 UTC) | Offset from `0 6` (playwright.yml) and `0 7` (goldminers) to avoid runner contention |
| Slack channel default | `mercury-alerts` | Follows team channel naming convention; matches assumption in spec |
| RP project (scheduled) | `jamf_capabilities` | Consistent with other scheduled runs |
| RP attributes | `team:mercury,env:stage` | Identifies Mercury team and stage environment in RP |
| push-to-main trigger | Included | Consistent with existing workflows |
| pull_request trigger | Excluded | ALME tests require enrolled Mac; not safe to run on every PR |

### Key finding: `jamfProBaseUrl` required on `workflow_dispatch` only

GitHub Actions `required: true` on a `workflow_dispatch` input enforces that the user must
provide the value in the UI. However, `required` does not apply to `push` or `schedule` triggers.
For those triggers, `jamfProBaseUrl` is empty and `JAMF_PRO_CUSTOM_BASE_URL` will be blank —
the reusable workflow will then fall back to the stage environment variables set in
`reusable-playwright-setup.yml` (`JAMF_PRO_DEVELOP_STAGE_BASE_URL`, `JAMF_PRO_GA_STAGE_BASE_URL`,
etc.). This is the correct and intended behaviour: scheduled runs use the known stage instance;
manual runs always require an explicit URL.

## Phase 1: Design

### Workflow structure

The new workflow mirrors `goldminers-playwright.yml` exactly, with these substitutions:

| Parameter | goldminers value | alme value |
|-----------|-----------------|------------|
| `name` | `Playwright Tests - Goldminers` | `Playwright Tests - ALME` |
| `schedule cron` | `0 7 * * *` | `0 8 * * *` |
| `pull_request` trigger | present | **absent** (enrolled Mac requirement) |
| `test_folder` default | `configuration-profiles` | `app-lifecycle-management` |
| `slack_channel` default | `gm-tests` | `mercury-alerts` |
| `notify_success` default | `false` | `false` |
| `notify_failure` default | `true` | `true` |
| `rp_project` default | `jamf_shared` | `jamf_shared` |
| push/schedule matrix | `@stage` / `configuration-profiles` | `@stage` / `app-lifecycle-management` |
| RP attributes | `team:goldminers,env:stage` | `team:mercury,env:stage` |
| `jamfProBaseUrl` | optional | **required** |

### `jamfProBaseUrl` required input

```yaml
jamfProBaseUrl:
  description: 'URL of the Jamf Pro server (required)'
  type: string
  required: true
```

GitHub Actions will block the workflow dispatch UI submission if this field is left empty.

### No `pull_request` trigger

Unlike `playwright.yml` and `goldminers-playwright.yml`, this workflow omits the
`pull_request` trigger entirely. ALME tests depend on an enrolled, supervised Mac being
reachable from the runner; that prerequisite cannot be guaranteed on every PR.

### Deliverable

Single file: `.github/workflows/alme-playwright.yml`

See [quickstart.md](./quickstart.md) for the exact file content and verification steps.
