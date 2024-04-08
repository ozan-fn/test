FROM node
WORKDIR /app
RUN mkdir api
COPY api/package.json api/package.json
RUN cd api && npm install
COPY . .
EXPOSE 3000
