FROM node:18.17.1 AS base
WORKDIR /srv/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 1337

CMD ["npm", "run", "develop", "--", "--watch-admin"]
