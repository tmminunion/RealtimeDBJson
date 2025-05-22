FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g pm2 && npm install

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]