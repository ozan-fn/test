FROM oven/bun:alpine

WORKDIR /app

COPY package.json .
RUN bun install

COPY ./ ./
COPY ./client/dist ./client/dist

RUN bun run build

ENV NODE_ENV production

ENV PORT 4000

CMD [ "bun", "dist/index.js" ]
