# Tasks: ALME GitHub Actions Workflow

**Input**: Design documents from `specs/001-alme-workflow/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the deliverable file location and validate existing workflow patterns

- [x] T001 Review `.github/workflows/goldminers-playwright.yml` as the reference template for `.github/workflows/alme-playwright.yml`

---

## Phase 2: User Story 1 - Trigger ALME Tests on Demand (Priority: P1) 🎯 MVP

**Goal**: Create the workflow file with `workflow_dispatch` trigger, optional `jamfProBaseUrl`
input, and correct wiring to the reusable setup workflow.

**Independent Test**: Trigger the workflow manually via the GitHub Actions UI. Confirm:
1. Only tests from `tests/app-lifecycle-management/` run.
2. Slack notification arrives in `mercury-alerts` on pass/fail.
3. No RP reporting unless `rp_project` is explicitly provided.

### Implementation for User Story 1

- [x] T002 [US1] Create `.github/workflows/alme-playwright.yml` with `workflow_dispatch` trigger, optional `jamfProBaseUrl`, `filter`, `test_folder`, and `rp_project` inputs
- [x] T003 [US1] Wire `run-playwright` job in `.github/workflows/alme-playwright.yml` to call `.github/workflows/reusable-playwright-setup.yml` with `test_folder: app-lifecycle-management`, hardcoded `slack_channel: mercury-alerts`, `notify_success: false`, `notify_failure: true`, and all required secrets
- [x] T004 [US1] Set `rp_project` and `rp_attributes` to empty string by default (no RP reporting unless explicitly provided) in `.github/workflows/alme-playwright.yml`

**Checkpoint**: Workflow file exists, passes YAML lint, and manual dispatch works ✅

---

## Phase 3: User Story 2 - Scheduled Nightly ALME Test Run (Priority: P2)

**Goal**: Add `push` to `main` and nightly `schedule` triggers with `@stage` filter default.

**Independent Test**: Inspect the workflow YAML and confirm:
1. `schedule: cron: "0 8 * * *"` is present.
2. `push: branches: [ main ]` is present.
3. No `pull_request` trigger exists.
4. Default `filter` falls back to `@stage`.

### Implementation for User Story 2

- [x] T005 [US2] Add `push: branches: [ main ]` and `schedule: cron: "0 8 * * *"` triggers to `.github/workflows/alme-playwright.yml`
- [x] T006 [US2] Set `filter` fallback to `@stage` in the `run-playwright` job of `.github/workflows/alme-playwright.yml` (no `pull_request` trigger)

**Checkpoint**: All triggers in place; push and scheduled runs use `@stage` filter ✅

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T007 Validate `.github/workflows/alme-playwright.yml` passes YAML lint and contains no `pull_request` trigger
- [x] T008 [P] Verify `specs/001-alme-workflow/quickstart.md` content matches the final workflow file

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 — MVP
- **Phase 3 (US2)**: Depends on Phase 2 (same file)
- **Phase 4 (Polish)**: Depends on Phase 3

---

## Notes

- Total tasks: 8
- Tasks per story: US1 = 3 (T002–T004), US2 = 2 (T005–T006)
- All tasks completed ✅
- No matrix — single direct call to `reusable-playwright-setup.yml`
- `slack_channel`, `notify_success`, `notify_failure` are hardcoded (not exposed as parameters)
- `rp_project` / `rp_attributes` default to empty (no RP reporting by default)
