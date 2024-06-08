FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV port=3000

EXPOSE 8080

EXPOSE 3000

CMD [ "npm","run","start"]