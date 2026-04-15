FROM node:20

WORKDIR /app

# Install PM2
RUN npm install -g pm2

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy semua file (termasuk folder public bawaan)
COPY . .

# Buat folder untuk data dan functions
RUN mkdir -p /app/data /app/functions

# Pastikan izin akses benar
RUN chmod -R 777 /app/data /app/functions /app/public

EXPOSE 8008

CMD ["pm2-runtime", "ecosystem.config.js"]