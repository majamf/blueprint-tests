# Research: ALME GitHub Actions Workflow

**Date**: 2026-04-17
**Feature**: ALME GitHub Actions Workflow
**Status**: Complete — no NEEDS CLARIFICATION items remain

## Decision Log

### 1. `jamfProBaseUrl` input

**Decision**: Optional `workflow_dispatch` input; no `required: true`.

**Rationale**: For manual runs the user passes the URL explicitly. For `push` and `schedule`
triggers the field is empty and the reusable workflow falls back to the stage env vars
(`JAMF_PRO_DEVELOP_STAGE_BASE_URL`, etc.). Both paths are correct and supported.

**Alternatives considered**:
- `required: true` — rejected; would prevent push/schedule triggers from working without extra
  workarounds
- Shell guard at job start — adds complexity for no benefit given the env-var fallback

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

**Decision**: Hardcoded `mercury-alerts`; not exposed as a dispatch parameter.

**Rationale**: The Mercury team always wants alerts in `mercury-alerts`. Removing it as a
parameter simplifies the dispatch UI and prevents accidental misdirection of alerts.

---

### 5. Report Portal reporting

**Decision**: Disabled by default (`rp_project` and `rp_attributes` empty). Opt-in by
providing `rp_project` at dispatch time.

**Rationale**: ALME tests are not yet on a continuous reporting cadence. Enabling RP by default
would create noise. Teams can opt-in when needed by passing `rp_project` at dispatch.

---

### 6. `push` to `main` trigger

**Decision**: Include, with `@stage` filter and `app-lifecycle-management` folder.

**Rationale**: Consistent with `playwright.yml` and `goldminers-playwright.yml`. Ensures the
ALME smoke test runs against the stage environment after every merge to main, giving fast
regression feedback without requiring manual dispatch.
