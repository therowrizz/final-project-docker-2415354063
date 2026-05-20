FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Memanfaatkan Docker layer cache untuk dependensi
COPY package*.json ./
RUN npm install
# Copy sisa core code aplikasi
COPY . .

# Menggunakan non-root user bawaan node image untuk keamanan
USER node

EXPOSE 3000

CMD ["node", "app.js"]