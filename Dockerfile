FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY src/ ./src/

RUN mkdir -p /app/data

COPY .env.example .env.example

CMD ["node", "src/index.js"]