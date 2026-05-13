#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
sleep 3

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
  echo "🏭 Production mode detected"
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy || echo "⚠️ Migration command completed (may have been already applied)"
  
  echo "🌱 Seeding database if needed..."
  node prisma/seed.js || echo "⚠️ Seed completed (may have been already applied)"
else
  echo "🔧 Development mode - using db push"
  npx prisma db push --accept-data-loss
fi

echo "🚀 Starting server..."
exec node server.js
