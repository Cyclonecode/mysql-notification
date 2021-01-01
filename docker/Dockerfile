FROM node:14.15.3

RUN apt update
RUN apt install nano

ARG WEBSOCKET_PORT=8080
ARG SERVER_PORT=2048
ARG SERVER_ADDRESS=127.0.0.1
ARG MYSQL_HOSTNAME=127.0.0.1

ENV WEBSOCKET_PORT=$WEBSOCKET_PORT
ENV SERVER_ADDRESS=$SERVER_ADDRESS
ENV SERVER_PORT=$SERVER_PORT
ENV MYSQL_HOSTNAME=$MYSQL_HOSTNAME

EXPOSE $WEBSOCKET_PORT
EXPOSE $SERVER_PORT

# This thing first installs npm packages and then it copies the committed files as an overlay
WORKDIR /usr/src/app
COPY package*json ./

RUN npm install --production --no-optional
COPY . .
CMD ["node", "scripts/server.js"]