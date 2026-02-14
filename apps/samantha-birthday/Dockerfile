FROM node:22-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY dist/apps/samantha-birthday/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/apps/samantha-birthday .

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Expose the port
EXPOSE 8080

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8080
ENV DATA_DIR=/app/data
ENV NODE_ENV=production

# Start the application
CMD ["node", "main.js"]
