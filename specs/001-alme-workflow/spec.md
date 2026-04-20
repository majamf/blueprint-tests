# Feature Specification: ALME GitHub Actions Workflow

**Feature Branch**: `MER-2426-INNOVATION-Blueprint-UI-tests`
**Created**: 2026-04-17
**Status**: Draft
**Input**: User description: "create github workflow for alme testing that will run tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts only. base on already created workflows"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trigger ALME Tests on Demand (Priority: P1)

A developer or QA engineer wants to manually trigger the ALME smoke test workflow to verify
that the ALME feature works correctly against a specific Jamf Pro instance without waiting for
a scheduled run.

**Why this priority**: Manual dispatch is the primary way to run ALME tests on demand against
specific environments, which is critical given the prerequisite of an enrolled, managed, and
supervised Mac device being available in the target environment.

**Independent Test**: Can be fully tested by triggering the workflow via `workflow_dispatch` and
verifying that `smoke-mercury-jpro.spec.ts` runs and results are reported to Slack and
Report Portal.

**Acceptance Scenarios**:

1. **Given** the workflow exists in `.github/workflows/`, **When** a user triggers it via
   GitHub Actions UI and provides a required Jamf Pro base URL parameter, **Then** the workflow
   runs only `tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts` and reports results.
2. **Given** the workflow runs, **When** tests pass, **Then** a success notification is sent to
   the configured Slack channel (if `notify_success` is `true`).
3. **Given** the workflow runs, **When** tests fail, **Then** a failure notification is sent to
   the configured Slack channel.

---

### User Story 2 - Scheduled Nightly ALME Test Run (Priority: P2)

The team wants ALME tests to run automatically on a nightly schedule so regressions are caught
without manual intervention.

**Why this priority**: Automated regression detection is essential but secondary to the ability
to run on demand, since ALME tests require specific infrastructure (enrolled Mac).

**Independent Test**: Can be verified by inspecting the `schedule` trigger in the workflow YAML
and confirming the cron expression is set to a daily cadence.

**Acceptance Scenarios**:

1. **Given** the workflow is in place, **When** the scheduled cron fires daily, **Then** the
   workflow runs the ALME spec against the stage environment and reports results.

---

### Edge Cases

- What happens when no Jamf Pro base URL is provided via `workflow_dispatch`? The workflow
  falls back to the Jamf Pro URL defined in the repository environment variable; if that
  variable is also absent the reusable workflow will have no URL and tests will fail.
- What happens when the enrolled Mac device is unavailable? Tests fail and a Slack failure
  notification is sent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workflow MUST run only tests from the `tests/app-lifecycle-management/` folder. Currently this folder contains a single spec (`smoke-mercury-jpro.spec.ts`); folder-scoped targeting is intentional and consistent with all other workflows in the repo.
- **FR-002**: The workflow MUST reuse the existing `reusable-playwright-setup.yml` workflow,
  following the same pattern as `playwright.yml` and `goldminers-playwright.yml`.
- **FR-003**: The workflow MUST support `workflow_dispatch` with `jamfProBaseUrl` as an input.
  For manual runs the URL is passed explicitly as a run parameter; for `push` and `schedule`
  triggers the URL is read from a repository environment variable. Both paths MUST be supported.
- **FR-003a**: Additional `workflow_dispatch` inputs (filter, test_folder, rp_project) MUST be
  supported. `slack_channel`, `notify_success`, and `notify_failure` are hardcoded and not
  exposed as parameters.
- **FR-004**: The workflow MUST run on a nightly schedule (daily cron).
- **FR-005**: The workflow MUST pass the correct secrets and environment-specific variables to
  the reusable workflow.
- **FR-006**: The default `test_folder` input MUST be `app-lifecycle-management`.
- **FR-007**: The default `slack_channel` MUST be specific to the ALME/Mercury team.
- **FR-008**: The workflow MUST support optional Report Portal reporting — `rp_project` can be
  provided at dispatch time; by default no results are sent to Report Portal.
- **FR-009**: On `push` to `main` and on `schedule`, the workflow MUST run with the `@stage`
  filter against the `app-lifecycle-management` folder.

### Key Entities

- **Workflow file**: New YAML file in `.github/workflows/` targeting the ALME spec exclusively.
- **Reusable workflow**: `.github/workflows/reusable-playwright-setup.yml` — unchanged, called
  via `uses:`.
- **Test spec**: `tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts` — the single file
  under test.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The workflow file passes YAML validation and is accepted by GitHub Actions without
  errors.
- **SC-002**: On manual dispatch, only tests from `tests/app-lifecycle-management/` run —
  no tests from other folders are executed.
- **SC-003**: On failure, a Slack notification is delivered to `mercury-alerts` within 2 minutes
  of workflow completion.
- **SC-004**: When `rp_project` is provided at dispatch time, Report Portal receives results
  for that run.
- **SC-005**: The workflow completes within 60 minutes (matching the existing timeout used in
  the reusable setup).

## Clarifications

### Session 2026-04-17

- Q: Does the ALME workflow need additional secrets beyond the standard set? → A: No — the enrolled computer is identified dynamically via the Jamf Pro API using existing API credentials; no extra secrets required.
- Q: Should the workflow retry automatically on failure? → A: No workflow-level retry — rely on Playwright's 2 built-in test retries, consistent with all other workflows in the repo.
- Correction: `jamfProBaseUrl` is not strictly required for manual dispatch — it is passed as a run parameter for manual runs and read from an environment variable for push/schedule runs. Slack channel is `mercury-alerts`.

## Assumptions

- For manual (`workflow_dispatch`) runs the Jamf Pro URL is passed explicitly as a run
  parameter. For `push` and `schedule` runs it is read from a repository environment variable
  (e.g., `JAMF_PRO_CUSTOM_BASE_URL` or the stage env var set in the reusable workflow).
- The target environment for scheduled and push runs is `stage`.
- The Slack channel for ALME/Mercury notifications is `mercury-alerts` (canonical name, consistent with the `<team>-tests` convention used by `ocean-tests` and `gm-tests`).
- The `rp_project` for scheduled runs is `jamf_capabilities`, consistent with other workflows.
- `notify_success` is hardcoded to `false` and `notify_failure` to `true`; neither is exposed
  as a run parameter.
- No new secrets are required; the enrolled computer is found dynamically via the Jamf Pro API using the existing API credentials (`JAMF_PRO_STAGE_API_USERNAME` / `JAMF_PRO_STAGE_API_PASSWORD`).
- The enrolled, managed, and supervised Mac device prerequisite is an environmental concern and
  is outside the scope of this workflow definition.
