#!/bin/sh
set -e

echo " Waiting for database to be ready..."
sleep 2

echo " Running Prisma DB push..."
npx prisma db push --accept-data-loss

echo " Seeding database..."
node prisma/seed.js

echo " Starting server..."
node server.js
