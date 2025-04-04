# base
FROM oven/bun:alpine AS base
WORKDIR /app
COPY ./client/package.json ./client/bun.lock ./
RUN bun install
COPY ./client /app
RUN bun run build

# deploy
FROM oven/bun:alpine
WORKDIR /app
COPY ./package.json ./bun.lock ./
RUN bun install 
COPY ./ ./
COPY --from=base /app/out ./client/out
ENV NODE_ENV=production
ENV PORT=4000
CMD bun src/index.ts
