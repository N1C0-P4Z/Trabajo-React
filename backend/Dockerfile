FROM node:22-alpine
WORKDIR /app

# Install openssl (required by Prisma) and build tools for native deps
RUN apk add --no-cache openssl libc6-compat

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Generate Prisma Client if schema exists (safe no-op if missing)
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Make startup script executable
RUN chmod +x /app/start.sh

EXPOSE 3001

CMD ["/app/start.sh"]
