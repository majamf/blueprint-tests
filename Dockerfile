FROM mcr.microsoft.com/playwright:v1.50.0-noble AS base

RUN npm install corepack@^0.31.0 -g && \
    corepack enable pnpm

WORKDIR /app

COPY package.json package.json

RUN pnpm install

COPY . .

ENTRYPOINT ["pnpm", "exec", "playwright", "test"]
