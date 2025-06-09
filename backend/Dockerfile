FROM node:18-alpine

WORKDIR /app

# Install global dependencies
RUN npm install -g typescript ts-node

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npx", "ts-node", "src/server.ts"] 