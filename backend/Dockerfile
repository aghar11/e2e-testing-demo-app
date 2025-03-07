# Use the Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Prepare playwright
RUN npx playwright install
RUN npx playwright install-deps

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Start application
CMD ["node", "server.js"]