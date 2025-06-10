FROM node:18-alpine

WORKDIR /app

# Install global dependencies and curl for healthcheck
RUN apk add --no-cache curl && \
    npm install -g typescript ts-node

# Copy package files
COPY package*.json ./

# Update multer to version 1.4.4
RUN npm install multer@1.4.4 --save

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npx", "ts-node", "src/server.ts"] 