FROM node:18.16.0-alpine

WORKDIR /bot

RUN npm install -g npm@9.6.7

COPY package*.json ./

COPY .npmrc ./

RUN npm ci

COPY . .

RUN npm run build \
  && npm prune --production \
  && npm cache clean --force

ENV NODE_ENV=$NODE_ENV

CMD ["node", "build/index.js"]
