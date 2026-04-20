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
  MUST fail fast with a clear error — there is no fallback URL, as the instance is always
  required.
- What happens when the enrolled Mac device is unavailable? Tests fail and a Slack failure
  notification is sent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workflow MUST run only `tests/app-lifecycle-management/smoke-mercury-jpro.spec.ts`.
- **FR-002**: The workflow MUST reuse the existing `reusable-playwright-setup.yml` workflow,
  following the same pattern as `playwright.yml` and `goldminers-playwright.yml`.
- **FR-003**: The workflow MUST support `workflow_dispatch` with `jamfProBaseUrl` as a
  **required** input — the workflow MUST NOT run without it being explicitly provided.
- **FR-003a**: Additional `workflow_dispatch` inputs (filter, slack_channel, notify_success,
  notify_failure, rp_project) MUST be supported, consistent with existing workflows.
- **FR-004**: The workflow MUST run on a nightly schedule (daily cron).
- **FR-005**: The workflow MUST pass the correct secrets and environment-specific variables to
  the reusable workflow.
- **FR-006**: The default `test_folder` input MUST be `app-lifecycle-management`.
- **FR-007**: The default `slack_channel` MUST be specific to the ALME/Mercury team.
- **FR-008**: The workflow MUST report results to Report Portal using an appropriate project
  and attributes identifying the Mercury team and environment.
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
- **SC-003**: Slack notifications are delivered within 2 minutes of workflow completion for both
  pass and fail outcomes.
- **SC-004**: Report Portal receives results tagged with the Mercury team and the correct
  environment within every workflow run.
- **SC-005**: The workflow completes within 60 minutes (matching the existing timeout used in
  the reusable setup).

## Assumptions

- The Jamf Pro instance URL is always provided as a mandatory run parameter; there is no
  default or fallback URL baked into the workflow.
- The target environment for scheduled and push runs is `stage`, but the Jamf Pro URL for
  those runs is supplied via the required parameter at dispatch time.
- The Slack channel for ALME/Mercury notifications follows the naming convention of existing
  channels (e.g., `mercury-tests`); the exact name can be adjusted at implementation time.
- The `rp_project` for scheduled runs is `jamf_capabilities`, consistent with other workflows.
- `notify_success` defaults to `false` and `notify_failure` defaults to `true`, following the
  same conservative pattern as `goldminers-playwright.yml`.
- No new secrets are required; all required credentials already exist as repository secrets.
- The enrolled, managed, and supervised Mac device prerequisite is an environmental concern and
  is outside the scope of this workflow definition.
