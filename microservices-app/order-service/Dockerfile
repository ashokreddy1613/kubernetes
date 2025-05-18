# Use lightweight Node.js base image
FROM node:23-slim

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the application code
COPY app.js .

# Expose internal port
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"]
