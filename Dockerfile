# base
FROM oven/bun:alpine AS base
WORKDIR /app
COPY ./client/package.json ./
RUN bun install
COPY ./client /app
RUN bun run build

# deploy
FROM oven/bun:alpine
WORKDIR /app
COPY package.json ./
RUN bun install
COPY ./ ./
COPY --from=base /app/dist ./client/dist
RUN bun run build
ENV NODE_ENV=production
ENV PORT=4000
CMD ["bun", "dist/index.js"]
