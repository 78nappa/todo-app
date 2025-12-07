FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port 3001
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]
