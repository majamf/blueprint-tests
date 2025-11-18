# Blueprint Tests

Repository for E2E test of blueprint features

## Test tagging

You can tag tests with various tags to run specific tests. The tags are:

| Tag             | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `@stanalone`    | Run against stanadalone Blueprints mFE                      |
| `@school`       | Run against Jamf School                                     |
| `@pro`          | Run against Jamf Pro - latest develop                       |
| `@pro-legacy`   | Run against older versions of Jamf Pro (RC, GA, GA-1, GA-2) |
| `@sbox`         | Run in SBOX environment                                     |
| `@dev`          | Run in DEV environment                                      |
| `@stage`        | Run in STAGE environment                                    |
| `@prod`         | Run in PROD environment                                     |
| `@all-browsers` | Run in all available browsers (Chrome, Firefox, Safari)     |
| `@chrome`       | Run in Chrome (chromium)                                    |
| `@firefox`      | Run in Firefox                                              |
| `@safari`       | Run in Safari (webkit)                                      |
| `@mimic`        | Marks tests using Mimic devices, no effect on execution     |

For test to be run, it must have at least one of the host tags, one of the environment tags and one of the browser tags.

## Environment variables

To start using the environment variables you need to copy and rename the example file to `.env`.
`.env` file is ignored by git, so you can do whatever changes you'd like.

```sh
cp .env.example .env
```

| Variable                                                                     | Description                     |
| ---------------------------------------------------------------------------- | ------------------------------- |
| `STANDALONE_SBOX_BASE_URL`                                                   | Standalone environment base URL |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_BASE_URL`                                    | Jamf School base URL            |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_API_USERNAME`                                | Jamf School API username        |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_API_PASSWORD`                                | Jamf School API password        |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_ACCOUNT_EMAIL`                               | Jamf Account email              |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_ACCOUNT_PASSWORD`                            | Jamf Account password           |
| `JAMF_SCHOOL_CUSTOM_BASE_URL`                                                | Jamf School base URL            |
| `JAMF_SCHOOL_CUSTOM_API_USERNAME`                                            | Jamf School API username        |
| `JAMF_SCHOOL_CUSTOM_API_PASSWORD`                                            | Jamf School API password        |
| `JAMF_SCHOOL_CUSTOM_ACCOUNT_EMAIL`                                           | Jamf Account email              |
| `JAMF_SCHOOL_CUSTOM_ACCOUNT_PASSWORD`                                        | Jamf Account password           |
| `JAMF_PRO_{DEVELOP\|RC\|GA\|GA_1\|GA_2}_{DEV\|STAGE\|PROD}_BASE_URL`         | Jamf Pro base URL               |
| `JAMF_PRO_{DEVELOP\|RC\|GA\|GA_1\|GA_2}_{DEV\|STAGE\|PROD}_API_USERNAME`     | Jamf Pro API username           |
| `JAMF_PRO_{DEVELOP\|RC\|GA\|GA_1\|GA_2}_{DEV\|STAGE\|PROD}_API_PASSWORD`     | Jamf Pro API password           |
| `JAMF_PRO_{DEVELOP\|RC\|GA\|GA_1\|GA_2}_{DEV\|STAGE\|PROD}_ACCOUNT_EMAIL`    | Jamf Account email              |
| `JAMF_PRO_{DEVELOP\|RC\|GA\|GA_1\|GA_2}_{DEV\|STAGE\|PROD}_ACCOUNT_PASSWORD` | Jamf Account password           |
| `JAMF_PRO_CUSTOM_BASE_URL`                                                   | Jamf Pro base URL               |
| `JAMF_PRO_CUSTOM_API_USERNAME`                                               | Jamf Pro API username           |
| `JAMF_PRO_CUSTOM_API_PASSWORD`                                               | Jamf Pro API password           |
| `JAMF_PRO_CUSTOM_ACCOUNT_EMAIL`                                              | Jamf Account email              |
| `JAMF_PRO_CUSTOM_ACCOUNT_PASSWORD`                                           | Jamf Account password           |
| `RP_URL`                                                                     | Report Portal URL               |
| `RP_PROJECT`                                                                 | Report Portal project name      |
| `RP_API_KEY`                                                                 | Report Portal API key           |

For Stage environments you can use credentials from 1Password (**Ocean Stage Account**, **Jamf Pro Stage API**, **Jamf School Stage API**).
