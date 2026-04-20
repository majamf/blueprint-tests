# Research: ALME GitHub Actions Workflow

**Date**: 2026-04-17
**Feature**: ALME GitHub Actions Workflow
**Status**: Complete — no NEEDS CLARIFICATION items remain

## Decision Log

### 1. Required input enforcement for `jamfProBaseUrl`

**Decision**: Use `required: true` on the `workflow_dispatch` input definition.

**Rationale**: GitHub Actions natively supports `required: true` for `workflow_dispatch` inputs
since 2022. The GitHub Actions UI will prevent form submission if the field is empty. No
additional scripting needed.

**Alternatives considered**:
- Shell guard at job start (`if [ -z "$URL" ]; then exit 1; fi`) — adds complexity, fires later
- Default to a known URL — rejected per spec FR-003 (no fallback)

**Note**: `required` only applies to `workflow_dispatch`. For `push` and `schedule` triggers
the field is always empty — the reusable workflow falls back to stage env vars, which is correct.

---

### 2. Schedule cron time

**Decision**: `0 8 * * *` (08:00 UTC daily)

**Rationale**: Avoids runner contention with:
- `playwright.yml` — `0 6 * * *`
- `goldminers-playwright.yml` — `0 7 * * *`

One-hour gap per workflow is sufficient given typical test suite duration (<60 min).

**Alternatives considered**: `0 9` or `0 10` — unnecessarily late; `0 8` is a clean slot.

---

### 3. `pull_request` trigger

**Decision**: Omit the `pull_request` trigger entirely.

**Rationale**: ALME tests require an enrolled, managed, supervised Mac reachable from the
runner. This infrastructure is not guaranteed on every PR, so auto-running on PRs would produce
unreliable results. Manual dispatch and nightly schedule are sufficient for this flow.

**Alternatives considered**: Include `pull_request` with a path filter — rejected because the
infrastructure constraint applies regardless of which files changed.

---

### 4. Slack channel

**Decision**: Default `mercury-tests`

**Rationale**: Follows the `<team>-tests` naming convention established by `ocean-tests` and
`gm-tests`. The Mercury team owns this workflow. The exact channel name can be overridden at
dispatch time via `workflow_dispatch` input.

---

### 5. Report Portal attributes

**Decision**: `team:mercury,env:stage`

**Rationale**: Consistent with `team:goldminers,env:stage` used in `goldminers-playwright.yml`.
Enables filtering by team and environment in Report Portal dashboards.

---

### 6. `push` to `main` trigger

**Decision**: Include, with `@stage` filter and `app-lifecycle-management` folder.

**Rationale**: Consistent with `playwright.yml` and `goldminers-playwright.yml`. Ensures the
ALME smoke test runs against the stage environment after every merge to main, giving fast
regression feedback without requiring manual dispatch.
