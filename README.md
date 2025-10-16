# Blueprint Tests

Repository for E2E test of blueprint features

### Environment variables

To start using the environment variables you need to copy and rename the example file to `.env`.
`.env` file is ignored by git, so you can do whatever changes you'd like.

```sh
cp .env.example .env
```

| Variable                                                                                | Description                         |
| --------------------------------------------------------------------------------------- | ----------------------------------- |
| `STANDALONE_SBOX_BASE_URL`                                                              | Standalone environment base URL     |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_BASE_URL`                                               | Jamf School base URL                |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_API_USERNAME`                                           | Jamf School API username            |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_API_PASSWORD`                                           | Jamf School API password            |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_ACCOUNT_EMAIL`                                          | Jamf Account email                  |
| `JAMF_SCHOOL_{DEV\|STAGE\|PROD}_ACCOUNT_PASSWORD`                                       | Jamf Account password               |
| `JAMF_SCHOOL_CUSTOM_BASE_URL`                                                           | Jamf School base URL                |
| `JAMF_SCHOOL_CUSTOM_API_USERNAME`                                                       | Jamf School API username            |
| `JAMF_SCHOOL_CUSTOM_API_PASSWORD`                                                       | Jamf School API password            |
| `JAMF_SCHOOL_CUSTOM_ACCOUNT_EMAIL`                                                      | Jamf Account email                  |
| `JAMF_SCHOOL_CUSTOM_ACCOUNT_PASSWORD`                                                   | Jamf Account password               |
| `JAMF_PRO_[{RC\|GA\|GA_1\|GA_2\|ASYNC_DEPLOYMENT}_]{DEV\|STAGE\|PROD}_BASE_URL`         | Jamf Pro / Jamf School base URL     |
| `JAMF_PRO_[{RC\|GA\|GA_1\|GA_2\|ASYNC_DEPLOYMENT}_]{DEV\|STAGE\|PROD}_API_USERNAME`     | Jamf Pro / Jamf School API username |
| `JAMF_PRO_[{RC\|GA\|GA_1\|GA_2\|ASYNC_DEPLOYMENT}_]{DEV\|STAGE\|PROD}_API_PASSWORD`     | Jamf Pro / Jamf School API password |
| `JAMF_PRO_[{RC\|GA\|GA_1\|GA_2\|ASYNC_DEPLOYMENT}_]{DEV\|STAGE\|PROD}_ACCOUNT_EMAIL`    | Jamf Account email                  |
| `JAMF_PRO_[{RC\|GA\|GA_1\|GA_2\|ASYNC_DEPLOYMENT}_]{DEV\|STAGE\|PROD}_ACCOUNT_PASSWORD` | Jamf Account password               |
| `JAMF_PRO_CUSTOM_BASE_URL`                                                              | Jamf Pro / Jamf School base URL     |
| `JAMF_PRO_CUSTOM_API_USERNAME`                                                          | Jamf Pro / Jamf School API username |
| `JAMF_PRO_CUSTOM_API_PASSWORD`                                                          | Jamf Pro / Jamf School API password |
| `JAMF_PRO_CUSTOM_ACCOUNT_EMAIL`                                                         | Jamf Account email                  |
| `JAMF_PRO_CUSTOM_ACCOUNT_PASSWORD`                                                      | Jamf Account password               |
| `RP_URL`                                                                                | Report Portal URL                   |
| `RP_PROJECT`                                                                            | Report Portal project name          |
| `RP_API_KEY`                                                                            | Report Portal API key               |

For Stage environments you can use credentials from 1Password (**Ocean Stage Account**, **Jamf Pro Stage API**, **Jamf School Stage API**).
