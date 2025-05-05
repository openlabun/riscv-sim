FROM node:22-alpine

RUN corepack enable

RUN mkdir -p /web
WORKDIR /web

COPY package.json /web
RUN yarn install

EXPOSE 8000
ENV CHOKIDAR_USEPOLLING=true

CMD ["yarn", "run", "dev"]