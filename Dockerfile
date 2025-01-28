FROM mcr.microsoft.com/playwright:v1.50.0-noble AS base
RUN corepack enable

WORKDIR /app

COPY package.json package.json

RUN pnpm install

COPY . .

ENTRYPOINT ["pnpm", "exec", "playwright", "test"]
