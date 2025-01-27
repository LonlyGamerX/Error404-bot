# Use Node.js as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the src folder and all other project files
COPY . .

# Define environment variables
ENV NODE_ENV=production

# Start the bot
CMD ["node", "src/main.js"]