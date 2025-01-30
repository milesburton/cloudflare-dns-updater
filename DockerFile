FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy application files
COPY . .

# Expose port (not strictly necessary for this script but good practice)
EXPOSE 3000

# Ensure the .env file is loaded from an external volume
VOLUME /app/config

# Command to run the application
CMD ["bun", "run", "index.ts"]

