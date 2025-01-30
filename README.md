# 🌐 Cloudflare DNS Updater

A TypeScript application built with Bun that automatically updates Cloudflare DNS records when your external IP address changes. Perfect for maintaining dynamic DNS settings for your domain. Optimised for performance and ease of use.

## 🚀 Features

- Automatic DNS record updates when your IP changes
- Configurable check intervals
- Docker support for containerised deployment
- Built with TypeScript and Bun for optimal performance
- Automatic Record ID retrieval from Cloudflare
- Comprehensive logging and error handling

## 📋 Prerequisites

You'll need the following to get started:

### Required
- A Cloudflare account with:
  - An API token with DNS edit permissions for your domain
  - A domain managed through Cloudflare
- Node.js 16+ (if running without Docker)

### Optional (Choose One)
- **Local Development:**
  - [Bun](https://bun.sh/) installed on your system
  - Git for version control
- **Docker Deployment:**
  - Docker Engine 20.10.0 or newer
  - Docker Compose (recommended for easier management)

## ⚙️ Configuration

### Environment Setup

1. Create a configuration directory:
```sh
mkdir -p ~/cloudflare-dns-updater-config
```

2. Create a `.env` file in the configuration directory:
```sh
cat <<EOT >> ~/cloudflare-dns-updater-config/.env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
DOMAIN=your_domain
CHECK_IP_SERVICE=https://api64.ipify.org?format=json
EOT
```

3. Link the configuration to your project:
```sh
ln -s ~/cloudflare-dns-updater-config/.env .env
```

### Configuration Options

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| CLOUDFLARE_API_TOKEN | Your Cloudflare API token | Yes | - |
| DOMAIN | The domain to update | Yes | - |
| CHECK_IP_SERVICE | Service to check your public IP | No | api64.ipify.org |

## 🚀 Getting Started

### Local Development

1. Install dependencies:
```sh
bun install
```

2. Start the application:
```sh
bun run start
```

### Docker Deployment

1. Build the container:
```sh
docker build -t cloudflare-dns-updater .
```

2. Run with persistent configuration:
```sh
docker run -d \
  --name cloudflare-dns-updater \
  --restart unless-stopped \
  --env-file ~/cloudflare-dns-updater-config/.env \
  -v ~/cloudflare-dns-updater-config:/app/config \
  cloudflare-dns-updater
```

## 🧪 Testing

The application includes several testing modes:

```sh
# Test mode (no Cloudflare updates)
bun run start --test

# Force update mode
bun run start --force

# Check logs in Docker
docker logs cloudflare-dns-updater
```

## 🛠 Development

### Code Quality

Maintain code quality with built-in tools:

```sh
# Lint code
bun run lint

# Format code
bun run format
```

### Example Output

```
12:34:56 Z 🚀 Starting Cloudflare Dynamic DNS updater...
12:34:57 Z 🌍 Fetching current public IP...
12:34:58 Z ✅ Current IP retrieved: 192.168.1.1
```

## 🔍 Troubleshooting

Common issues and solutions:

1. **API Token Issues**
   - Verify token permissions in Cloudflare dashboard
   - Ensure token has DNS edit access

2. **Container Won't Start**
   - Check logs: `docker logs cloudflare-dns-updater`
   - Verify environment file exists and is readable

3. **DNS Not Updating**
   - Confirm IP change detection is working
   - Check Cloudflare API response in logs

## 📄 License

This project is licenced under the [MIT Licence](./LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.