FROM mcr.microsoft.com/playwright:v1.53.0

RUN corepack enable pnpm

WORKDIR /app

COPY package.json package.json

RUN pnpm install

COPY . .

ENTRYPOINT ["pnpm", "exec", "playwright", "test"]
