FROM node:22

WORKDIR /usr/src/app

COPY website-server/package*.json .

RUN npm install

COPY website-server .

EXPOSE 3000

CMD [ "npm", "start" ]
