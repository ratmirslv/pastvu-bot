FROM node:14.15.1-alpine

WORKDIR /bot

RUN npm install -g npm@6.14.13

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build \
  && npm prune --production \
  && npm cache clean --force

ENV NODE_ENV=$NODE_ENV

CMD ["node", "build/index.js"]
