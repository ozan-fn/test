FROM node
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run dev
EXPOSE 3000
CMD cd api && npm start
