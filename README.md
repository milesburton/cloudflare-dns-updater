# 🌐 Cloudflare DNS Updater

A TypeScript application built with Bun that automatically updates Cloudflare DNS records when your external IP address changes. Perfect for maintaining dynamic DNS settings for your domain. Optimised for performance and ease of use.

## 🚀 Features

- Automatic DNS record updates when your IP changes
- Flexible running modes: one-time check or continuous monitoring
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

### Running Modes

The application supports two running modes:

1. **One-time Check (Default)**
   ```sh
   bun run start
   ```
   Perfect for use with cron jobs or scheduled tasks.

2. **Continuous Monitoring**
   ```sh
   bun run start --interval=15  # Checks every 15 minutes
   ```
   Keeps running and checks at specified intervals.

### Command Line Options

| Flag | Description | Example | Default |
|------|-------------|---------|---------|
| --interval=X | Run continuously, checking every X minutes | --interval=15 | Single run |
| --test | Run without making actual DNS updates | --test | false |
| --force | Force DNS update even if IP hasn't changed | --force | false |

Multiple flags can be combined, for example:
```sh
bun run start --test --interval=5  # Test mode, checking every 5 minutes
bun run start --force --interval=30  # Force updates every 30 minutes
```

### Local Development

1. Install dependencies:
```sh
bun install
```

2. Start the application:
```sh
bun run start       # One-time check
# or
bun run start --interval=30  # Check every 30 minutes
```

### Docker Deployment

1. Build the container:
```sh
docker build -t cloudflare-dns-updater .
```

2. Run with persistent configuration:
```sh
# One-time check
docker run -d \
  --name cloudflare-dns-updater \
  --env-file ~/cloudflare-dns-updater-config/.env \
  -v ~/cloudflare-dns-updater-config:/app/config \
  cloudflare-dns-updater

# Continuous monitoring
docker run -d \
  --name cloudflare-dns-updater \
  --restart unless-stopped \
  --env-file ~/cloudflare-dns-updater-config/.env \
  -v ~/cloudflare-dns-updater-config:/app/config \
  cloudflare-dns-updater --interval=15
```

### Cron Job Setup (Alternative to --interval)

For one-time check mode, you can create a cron job:

```sh
# Check every 15 minutes
*/15 * * * * cd /path/to/app && bun run start
```

## 🧪 Testing

The application includes several testing modes:

```sh
# Test mode (no Cloudflare updates)
bun run start --test

# Force update mode
bun run start --force

# Test continuous monitoring
bun run start --test --interval=5

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

4. **Interval Mode Issues**
   - Ensure the interval value is a positive number
   - Check system sleep/hibernate settings

## 📄 Licence

This project is licenced under the [MIT Licence](./LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.