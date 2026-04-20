# Tasks: ALME GitHub Actions Workflow

**Input**: Design documents from `specs/001-alme-workflow/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the deliverable file location and validate existing workflow patterns

- [ ] T001 Review `.github/workflows/goldminers-playwright.yml` as the reference template for `.github/workflows/alme-playwright.yml`

---

## Phase 2: User Story 1 - Trigger ALME Tests on Demand (Priority: P1) 🎯 MVP

**Goal**: Create the workflow file with `workflow_dispatch` trigger, `jamfProBaseUrl` as a
required input, and correct wiring to the reusable setup workflow.

**Independent Test**: Trigger the workflow manually via the GitHub Actions UI. Confirm:
1. `jamfProBaseUrl` field is marked required and blocks submission when empty.
2. Only tests from `tests/app-lifecycle-management/` run.
3. Slack notification arrives in the configured channel on pass/fail.
4. Report Portal shows a launch tagged `team:mercury`.

### Implementation for User Story 1

- [ ] T002 [US1] Create `.github/workflows/alme-playwright.yml` with `workflow_dispatch` trigger (including `jamfProBaseUrl` as `required: true`) using content from `specs/001-alme-workflow/quickstart.md`
- [ ] T003 [US1] Wire `run-playwright` job in `.github/workflows/alme-playwright.yml` to call `.github/workflows/reusable-playwright-setup.yml` with `test_folder: app-lifecycle-management` and all required secrets
- [ ] T004 [US1] Set `slack_channel` default to `mercury-alerts` and `notify_failure` default to `true` in `.github/workflows/alme-playwright.yml`
- [ ] T005 [US1] Set `rp_project` default to `jamf_shared` in the `workflow_dispatch` matrix of `.github/workflows/alme-playwright.yml`

**Checkpoint**: Workflow file exists, passes YAML lint, and manual dispatch works with required URL input

---

## Phase 3: User Story 2 - Scheduled Nightly ALME Test Run (Priority: P2)

**Goal**: Add `push` to `main` and nightly `schedule` triggers to the workflow, with the
correct `@stage` filter and matrix entry.

**Independent Test**: Inspect the workflow YAML and confirm:
1. `schedule: cron: "0 8 * * *"` is present.
2. `push: branches: [ main ]` is present.
3. The `push|schedule` matrix entry uses `@stage` filter and `app-lifecycle-management` folder.
4. No `pull_request` trigger exists in the file.

### Implementation for User Story 2

- [ ] T006 [US2] Add `push: branches: [ main ]` and `schedule: cron: "0 8 * * *"` triggers to `.github/workflows/alme-playwright.yml`
- [ ] T007 [US2] Add `push|schedule` case to the `define-matrix` step in `.github/workflows/alme-playwright.yml` with `filter: "@stage"`, `test_folder: "app-lifecycle-management"`, `rp_project: "jamf_capabilities"`, `rp_attributes: "team:mercury,env:stage"`

**Checkpoint**: All triggers in place; scheduled and push runs target stage with correct matrix

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T008 Run YAML lint on `.github/workflows/alme-playwright.yml` (e.g., `yamllint` or GitHub Actions dry-run) and confirm no `pull_request` trigger is present
- [ ] T009 [P] Verify `specs/001-alme-workflow/quickstart.md` verification steps are complete and match the final workflow file content

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1; this is the MVP — complete and validate before Phase 3
- **Phase 3 (US2)**: Depends on Phase 2 (adds triggers to the same file)
- **Phase 4 (Polish)**: Depends on Phase 3 completion

### User Story Dependencies

- **US1 (P1)**: Independent — creates the file from scratch
- **US2 (P2)**: Extends the same file created in US1 — sequential, not parallel

### Within Each User Story

- T002 must complete before T003–T005 (file must exist first)
- T006–T007 edit the same file and should be done sequentially

---

## Parallel Example: User Story 1

```text
T002 → T003 → T004 (sequential, same file)
T005 can follow T003 independently (different section)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002–T005) — creates a working manual-dispatch workflow
3. **STOP and VALIDATE**: Trigger manually, confirm `jamfProBaseUrl` is required and tests run
4. Proceed to Phase 3 once MVP is confirmed

### Incremental Delivery

1. T001 — review reference workflow
2. T002–T005 — working `workflow_dispatch` workflow (MVP)
3. T006–T007 — add scheduled/push triggers
4. T008–T009 — lint and verify docs

---

## Notes

- [P] tasks = different sections/files, no shared dependencies
- Total tasks: 9
- Tasks per story: US1 = 4 (T002–T005), US2 = 2 (T006–T007)
- Parallel opportunities: minimal (single-file deliverable)
- Suggested MVP: complete through Phase 2 (T001–T006) for a working on-demand workflow
