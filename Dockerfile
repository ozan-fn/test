# base
FROM oven/bun:alpine AS base
WORKDIR /app
COPY ./client/package.json ./
COPY ./client/bun.lock ./
RUN bun install
COPY ./client /app
RUN bun build

# deploy
FROM oven/bun:alpine
WORKDIR /app
COPY ./package.json ./
COPY ./bun.lock ./
RUN bun install 
COPY ./ ./
COPY --from=base /app/dist ./client/dist
ENV NODE_ENV=production
ENV PORT=4000
CMD ["bun", "run", "start"]
