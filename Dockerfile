
# Specify the base image
FROM node:18

# Install dependencies for Puppeteer and Headless Chrome
RUN apt-get update && \
    apt-get install -y chromium && \
    rm -rf /var/lib/apt/lists/*

# Set environment variable for Puppeteer to use Headless Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY app app
WORKDIR /app
# Install dependencies
RUN npm ci

# Expose any necessary ports
EXPOSE 3000

# Start the app when the container starts
CMD [ "npm", "start" ]