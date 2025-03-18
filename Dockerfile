FROM oven/bun:alpine

WORKDIR /app

COPY package.json .
RUN bun install

COPY ./ ./
COPY ./client/dist ./client/dist

RUN bun run build

ENV NODE_ENV production

CMD [ "bun", "dist/index.js" ]
