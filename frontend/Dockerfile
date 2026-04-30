FROM node:22-alpine
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

EXPOSE 3000

# --host is required so Vite listens on 0.0.0.0 inside Docker
CMD ["npm", "run", "dev", "--", "--host"]
