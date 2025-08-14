FROM mcr.microsoft.com/playwright:v1.54.2

RUN corepack enable pnpm

WORKDIR /app

COPY package.json package.json

RUN pnpm install

COPY . .

ENTRYPOINT ["pnpm", "exec", "playwright", "test"]
