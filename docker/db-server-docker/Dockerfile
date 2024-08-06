FROM node:22

WORKDIR /usr/src/app

COPY db-server/package*.json .

RUN npm install

COPY db-server .

EXPOSE 3001

CMD [ "node", "index.js" ]
# CMD ["ls", "-R" ,"-a"]