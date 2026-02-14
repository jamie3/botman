FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY dist/apps/samantha-birthday/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/apps/samantha-birthday .

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Expose the port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV NODE_ENV=production

# Start the application
CMD ["node", "main.js"]
