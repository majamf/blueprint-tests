# Feature Specification: ALME GitHub Actions Workflow

**Feature Branch**: `MER-2426-INNOVATION-Blueprint-UI-tests`
**Created**: 2026-04-17
**Status**: Final
**Input**: User description: "create github workflow for alme testing that will run tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts only. base on already created workflows"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trigger ALME Tests on Demand (Priority: P1)

A developer or QA engineer wants to manually trigger the ALME smoke test workflow to verify
that the ALME feature works correctly against a specific Jamf Pro instance.

**Why this priority**: Manual dispatch is the only way to run ALME tests, which is appropriate
given the prerequisite of an enrolled, managed, and supervised Mac device being available in
the target environment.

**Independent Test**: Can be fully tested by triggering the workflow via `workflow_dispatch` and
verifying that `smoke-mercury-jpro.spec.ts` runs against the stage environment.

**Acceptance Scenarios**:

1. **Given** the workflow exists in `.github/workflows/`, **When** a user triggers it via
   GitHub Actions UI (optionally providing a Jamf Pro base URL parameter), **Then** the workflow
   runs only `tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts` with the `@stage` filter.
2. **Given** the workflow runs, **When** tests complete, **Then** a Playwright report artifact
   is uploaded and available in the GitHub Actions run.

---

### Edge Cases

- What happens when no Jamf Pro base URL is provided via `workflow_dispatch`? The reusable
  workflow falls back to the stage environment variable; if that is also absent, tests will fail.
- What happens when the enrolled Mac device is unavailable? Tests fail with a Playwright error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workflow MUST run only tests from the `tests/app-lifecycle-management/` folder
  with the `@stage` filter. Both are hardcoded and not exposed as dispatch parameters.
- **FR-002**: The workflow MUST reuse the existing `reusable-playwright-setup.yml` workflow
  via `uses:`, following the same pattern as `goldminers-playwright.yml`.
- **FR-003**: The workflow MUST support `workflow_dispatch` with `jamfProBaseUrl` as the only
  input. When provided, the URL is passed to the reusable workflow; when omitted, the reusable
  workflow falls back to the stage environment variable.
- **FR-004**: The workflow MUST only run on `workflow_dispatch` (no schedule, no push trigger).
- **FR-005**: The workflow MUST pass the correct secrets to the reusable workflow.
- **FR-006**: `slack_channel`, `notify_success`, `notify_failure`, `rp_project`, and
  `rp_attributes` MUST be hardcoded — none are exposed as dispatch parameters. Slack
  notifications are disabled (`notify_success: false`, `notify_failure: false`). Report Portal
  reporting is disabled (`rp_project: ''`).

### Key Entities

- **Workflow file**: `.github/workflows/alme-playwright.yml` — targets the ALME spec exclusively.
- **Reusable workflow**: `.github/workflows/reusable-playwright-setup.yml` — unchanged, called
  via `uses:`.
- **Test spec**: `tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts` — the single file
  under test.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The workflow file passes YAML validation and is accepted by GitHub Actions without
  errors.
- **SC-002**: On manual dispatch, only tests from `tests/app-lifecycle-management/` run with
  the `@stage` filter — no tests from other folders are executed.
- **SC-003**: The workflow completes within 60 minutes (matching the reusable setup timeout).
- **SC-004**: A Playwright report artifact is available after every run.

## Clarifications

### Session 2026-04-17

- Q: Does the ALME workflow need additional secrets beyond the standard set? → A: No — the enrolled computer is identified dynamically via the Jamf Pro API using existing API credentials; no extra secrets required.
- Q: Should the workflow retry automatically on failure? → A: No workflow-level retry — rely on Playwright's 2 built-in test retries, consistent with all other workflows in the repo.
- Correction: `jamfProBaseUrl` is optional — passed as a run parameter for manual runs, falls back to env var when omitted.

### Session 2026-04-21

- Removed schedule and push triggers — workflow is `workflow_dispatch` only (debug/manual use).
- Removed `filter`, `test_folder`, `rp_project` dispatch inputs — all hardcoded.
- Slack notifications disabled (`notify_success: false`, `notify_failure: false`).
- Report Portal reporting disabled (`rp_project: ''`).

## Assumptions

- The only trigger is `workflow_dispatch`; no automated scheduled or push-triggered runs.
- The target environment is always `stage` (hardcoded `@stage` filter).
- The test folder is always `app-lifecycle-management` (hardcoded).
- `notify_success` and `notify_failure` are both `false`; no Slack notifications are sent.
- No Report Portal reporting; `rp_project` and `rp_attributes` are empty.
- No new secrets are required; the enrolled computer is found dynamically via the Jamf Pro API
  using the existing API credentials (`JAMF_PRO_STAGE_API_USERNAME` / `JAMF_PRO_STAGE_API_PASSWORD`).
- The enrolled, managed, and supervised Mac device prerequisite is an environmental concern
  outside the scope of this workflow definition.
