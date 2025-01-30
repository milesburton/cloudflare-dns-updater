# 🌐 Cloudflare DNS Updater 🚀

This project is a simple TypeScript application using Bun that updates the Cloudflare DNS record for a given domain when the external IP address changes.

## 📌 Prerequisites

- 🛠 [Bun](https://bun.sh/) installed
- 🐳 Docker installed (optional for containerisation)
- 🔑 A Cloudflare API token with DNS edit permissions

## ⚙️ Configuration

### Setting Up the Environment

Ensure that a `.env` file exists in the project root. If it does not exist, create one with the following content:

```sh
if [ ! -f .env ]; then
  cat <<EOT >> .env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
ZONE_ID=your_zone_id
DOMAIN=london.agileview.co.uk
CHECK_IP_SERVICE=https://api64.ipify.org?format=json
EOT
  echo "✅ .env file created. Please update it with your actual credentials."
fi
```

### Automatic Record ID Retrieval

The script automatically retrieves the **Record ID** from Cloudflare. You no longer need to manually input it in the `.env` file.

### Using a Shared Configuration Folder

To keep the `.env` file in a central location for easier management, follow these steps:

1. **Ensure the configuration folder exists**:
   ```sh
   mkdir -p ~/cloudflare-dns-updater-config
   ```

2. **Move the `.env` file if it doesn't already exist**:
   ```sh
   if [ ! -f ~/cloudflare-dns-updater-config/.env ]; then
     mv .env ~/cloudflare-dns-updater-config/.env
   fi
   ```

3. **Create a symlink in the project directory**:
   ```sh
   if [ ! -L .env ]; then
     ln -s ~/cloudflare-dns-updater-config/.env .env
   fi
   ```

Now, modifications to `~/cloudflare-dns-updater-config/.env` will be reflected in the project.

## 📥 Installation

1. Install dependencies:
   ```sh
   bun install
   ```

2. Run the script manually:
   ```sh
   bun run index.ts
   ```


## 📜 Example Output (Formatted Logs)
```
12:34:56 Z 🚀 Starting Cloudflare Dynamic DNS updater...
12:34:57 Z 🌍 Fetching current public IP...
12:34:58 Z ✅ Current IP retrieved: 192.168.1.1
```

## 🛠 Code Formatting and Linting

To check for linting issues:
```sh
bun run lint
```

To auto-format the code using Prettier:
```sh
bun run format
```

## 🐳 Running with Docker

1. Build the Docker image:
   ```sh
   docker build -t cloudflare-dns-updater .
   ```

2. Run the container with the `.env` file mounted:
   ```sh
   docker run --rm --env-file ~/cloudflare-dns-updater-config/.env -v ~/cloudflare-dns-updater-config:/app/config cloudflare-dns-updater
   ```

## 🔄 Running Persistently with Docker

If you're using a shared configuration folder, update the Docker command to use the external `.env` file location:

```sh
docker run -d --name cloudflare-dns-updater --restart unless-stopped \
  --env-file ~/cloudflare-dns-updater-config/.env \
  -v ~/cloudflare-dns-updater-config:/app/config \
  cloudflare-dns-updater
```

To run the container persistently in the background and restart on system reboot:

1. Start the container in detached mode with auto-restart:
   ```sh
   docker run -d --name cloudflare-dns-updater --restart unless-stopped --env-file ~/cloudflare-dns-updater-config/.env -v ~/cloudflare-dns-updater-config:/app/config cloudflare-dns-updater
   ```

2. Check the running container:
   ```sh
   docker ps
   ```

3. Stop and remove the container if needed:
   ```sh
   docker stop cloudflare-dns-updater && docker rm cloudflare-dns-updater
   ```

## 🥾 Testing

To manually test that the script works without updating Cloudflare, log IP values:
```sh
bun run start --test
```

To force an update even if the IP hasn't changed, use:
```sh
bun run start --force
```

This can be useful for testing or ensuring DNS propagation.

To manually test that the script works without updating Cloudflare, log IP values:
```sh
bun run start --test
```

## 🔧 Handling Errors and Debugging

If you encounter errors, check the logs using:
```sh
docker logs cloudflare-dns-updater
```

Ensure that your `.env` file is correctly set up and that your Cloudflare API token has the required permissions.

## 📜 Licence
This project is licenced under the [MIT License](LICENSE).

