FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ["npm","run","build"]

ENV port=3000

EXPOSE 3000

CMD [ "npm","run","start"]

