# blueprint-tests

Repository for E2E test of blueprint features

### Env variables

#### Envs in code

Env files are stored in the root folder \*eg: `.env.example.stage` files.
To start using the envs variable you need to copy and rename the example file to `.env`.
`.env` file is ignored by git, so you can do whatever changes you'd like.

```sh
# copy and rename example .env to .env
cp .env.example.stage .env;
```

`JAMF_ACCOUNT_STAGE_USER_NAME` - you can use your own SSO credentials or use **Ocean Stage Account** from 1Password

`JAMF_PRO_STAGE_API_USERNAME` - use **Jamf Pro Stage API** from 1Password

`JAMF_SCHOOL_STAGE_API_USERNAME` - use **Jamf School Stage API** from 1Password
