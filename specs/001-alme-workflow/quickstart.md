# Quickstart: ALME GitHub Actions Workflow

## What to create

Single file: `.github/workflows/alme-playwright.yml`

## File content

```yaml
name: Playwright Tests - ALME
on:
  push:
    branches: [ main ]
  schedule:
    - cron: "0 8 * * *"
  workflow_dispatch:
    inputs:
      filter:
        description: 'Filter selecting which tests to run'
        type: string
      jamfProBaseUrl:
        description: 'URL of the Jamf Pro server'
        type: string
      slack_channel:
        description: 'Slack channel for notifications'
        required: true
        default: 'mercury-alerts'
        type: string
      notify_success:
        description: 'Set to true to notify test channel on success'
        default: 'false'
        type: string
      notify_failure:
        description: 'Set to true to notify test channel on failure'
        default: 'true'
        type: string
      test_folder:
        description: 'Select which folder to run tests from'
        default: 'app-lifecycle-management'
        type: string
      rp_project:
        description: 'Report Portal project to send results to'
        default: 'jamf_shared'
        type: string

jobs:
  setup:
    runs-on: [self-hosted, jamf-ubuntu-latest]
    outputs:
      jobs: ${{ steps.define-matrix.outputs.jobs }}
    steps:
      - id: define-matrix
        env:
          EVENT_NAME: ${{ github.event_name }}
          FILTER_INPUT: ${{ github.event.inputs.filter || '' }}
          TEST_FOLDER_INPUT: ${{ github.event.inputs.test_folder || 'app-lifecycle-management' }}
          RP_PROJECT_INPUT: ${{ github.event.inputs.rp_project || 'jamf_shared' }}
        run: |
          case "$EVENT_NAME" in
            push|schedule)
              jobs='[{"name":"Stage","filter":"@stage","test_folder":"app-lifecycle-management","rp_project":"jamf_capabilities","rp_attributes":"team:mercury,env:stage"}]'
              ;;
            workflow_dispatch)
              jobs=$(cat <<JSON
          [{"name":"All tests","filter":"${FILTER_INPUT}","test_folder":"${TEST_FOLDER_INPUT}","rp_project":"${RP_PROJECT_INPUT}","rp_attributes":""}]
          JSON
              )
              ;;
          esac
          echo "jobs=$jobs" >> "$GITHUB_OUTPUT"

  run-playwright:
    name: ${{ matrix.jobs.name }}
    uses: ./.github/workflows/reusable-playwright-setup.yml
    needs: setup
    strategy:
      fail-fast: false
      matrix:
        jobs: ${{ fromJSON(needs.setup.outputs.jobs) }}
    with:
      run-name: ${{ matrix.jobs.name }}
      filter: ${{ matrix.jobs.filter || '' }}
      jamfProBaseUrl: ${{ github.event.inputs.jamfProBaseUrl || '' }}
      sboxBaseUrl: ''
      slack_channel: ${{ github.event.inputs.slack_channel || 'mercury-alerts' }}
      notify_success: ${{ github.event.inputs.notify_success || 'false' }}
      notify_failure: ${{ github.event.inputs.notify_failure || 'true' }}
      test_folder: ${{ matrix.jobs.test_folder }}
      rp_project: ${{ matrix.jobs.rp_project }}
      rp_attributes: ${{ matrix.jobs.rp_attributes }}
    secrets:
      JAMF_ACCOUNT_STAGE_USER_MAIL: ${{ secrets.JAMF_ACCOUNT_STAGE_USER_MAIL }}
      JAMF_ACCOUNT_STAGE_USER_PASSWORD: ${{ secrets.JAMF_ACCOUNT_STAGE_USER_PASSWORD }}
      JAMF_PRO_STAGE_API_USERNAME: ${{ secrets.JAMF_PRO_STAGE_API_USERNAME }}
      JAMF_PRO_STAGE_API_PASSWORD: ${{ secrets.JAMF_PRO_STAGE_API_PASSWORD }}
      JAMF_SCHOOL_STAGE_API_USERNAME: ${{ secrets.JAMF_SCHOOL_STAGE_API_USERNAME }}
      JAMF_SCHOOL_STAGE_API_PASSWORD: ${{ secrets.JAMF_SCHOOL_STAGE_API_PASSWORD }}
      RP_API_KEY: ${{ secrets.RP_API_KEY }}
      GH_SLACK_TOKEN: ${{ secrets.GH_SLACK_TOKEN }}
```

## Verification steps

1. Push the file to the branch and open the Actions tab in GitHub.
2. Confirm the workflow appears as "Playwright Tests - ALME".
3. Click "Run workflow" — provide a Jamf Pro stage URL in the `jamfProBaseUrl` field (optional; falls back to env var if omitted).
4. Trigger with a valid Jamf Pro stage URL. Confirm only tests from
   `tests/app-lifecycle-management/` run.
5. Confirm Slack notification arrives in `mercury-alerts` (or the overridden channel).
6. Confirm Report Portal launch appears with `team:mercury` attribute.
