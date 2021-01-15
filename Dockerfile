
FROM node:12

WORKDIR /app

RUN npm install 

COPY . /app

EXPOSE 9000

CMD ["node", "index.js"]