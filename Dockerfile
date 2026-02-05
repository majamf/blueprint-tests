FROM mcr.microsoft.com/playwright:v1.58.1

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ENTRYPOINT ["pnpm", "exec", "playwright", "test"]
