#!/bin/bash

# Install dependencies
npm install --production

# Create necessary directories
mkdir -p public/uploads
mkdir -p public/themes

# Generate theme files
npm run setup

# Set environment variables (if not using .env)
export NODE_ENV=production
export PORT=3001

# Start the server
npm start 