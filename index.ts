import { config } from "dotenv";
import { fetch } from "bun";
import pino from "pino";
import pretty from "pino-pretty";

const logger = pino(
  pretty({
    colorize: true,
    translateTime: "HH:MM:ss Z",
    ignore: "pid,hostname",
  })
);

config();

// Environment variables and configuration
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.ZONE_ID;
let RECORD_ID: string | undefined = process.env.RECORD_ID;
const DOMAIN = process.env.DOMAIN;
const CHECK_IP_SERVICE = process.env.CHECK_IP_SERVICE || "https://api64.ipify.org?format=json";

// Command line arguments
const args = process.argv.slice(2);
const isTestMode = args.includes("--test");
const isForceUpdate = args.includes("--force");
const intervalFlag = args.find(arg => arg.startsWith("--interval="));
const intervalMinutes = intervalFlag 
  ? parseInt(intervalFlag.split("=")[1]) 
  : 0;

// Validate required environment variables
function validateConfig() {
  const required = [
    { name: 'CLOUDFLARE_API_TOKEN', value: CLOUDFLARE_API_TOKEN },
    { name: 'ZONE_ID', value: ZONE_ID },
    { name: 'DOMAIN', value: DOMAIN }
  ];

  const missing = required.filter(({ name, value }) => !value);
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.map(m => m.name).join(', ')}`);
    process.exit(1);
  }

  if (intervalMinutes < 0) {
    logger.error("Interval minutes must be a positive number");
    process.exit(1);
  }
}

async function getCurrentIP(): Promise<string | null> {
  try {
    logger.info("🌍 Fetching current public IP...");
    const response = await fetch(CHECK_IP_SERVICE);
    const data = await response.json();
    logger.info(`✅ Current IP retrieved: ${data.ip}`);
    return data.ip;
  } catch (error) {
    logger.error("❌ Failed to fetch current IP:", error);
    return null;
  }
}

async function getCloudflareRecordId(): Promise<string> {
  try {
    logger.info("🔍 Fetching Cloudflare DNS Record ID...");
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${DOMAIN}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (data.success && data.result.length > 0) {
      logger.info(`✅ Found Record ID: ${data.result[0].id}`);
      return data.result[0].id;
    }
    logger.error("⚠️ No matching DNS record found.");
    throw new Error("No matching DNS record found.");
  } catch (error) {
    logger.error("❌ Failed to fetch Cloudflare DNS record ID:", error);
    throw error;
  }
}

async function getCloudflareDNSRecord(): Promise<string | null> {
  if (!RECORD_ID) {
    RECORD_ID = await getCloudflareRecordId();
    if (!RECORD_ID) return null;
  }
  try {
    logger.info("📡 Fetching current Cloudflare DNS record...");
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    logger.info(`✅ Current Cloudflare DNS IP: ${data.result?.content || "Not found"}`);
    return data.result?.content || null;
  } catch (error) {
    logger.error("❌ Failed to fetch Cloudflare DNS record:", error);
    return null;
  }
}

async function updateCloudflareDNS(ip: string) {
  if (!RECORD_ID) {
    RECORD_ID = await getCloudflareRecordId();
    if (!RECORD_ID) return;
  }
  if (isTestMode) {
    logger.info(`🧪 [TEST MODE] Would update DNS record for ${DOMAIN} to ${ip}`);
    return;
  }
  try {
    logger.info(`🔄 Updating Cloudflare DNS record for ${DOMAIN} to ${ip}...`);
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "A",
          name: DOMAIN,
          content: ip,
          ttl: 1,
          proxied: false,
        }),
      }
    );
    const data = await response.json();
    if (data.success) {
      logger.info(`✅ Successfully updated DNS record for ${DOMAIN} to ${ip}`);
    } else {
      logger.error("❌ Failed to update DNS record:", data.errors);
    }
  } catch (error) {
    logger.error("❌ Error updating Cloudflare DNS record:", error);
  }
}

async function checkAndUpdate() {
  const currentIP = await getCurrentIP();
  if (!currentIP) return;

  const cloudflareIP = await getCloudflareDNSRecord();
  if (cloudflareIP === currentIP && !isForceUpdate) {
    logger.info("✅ IP address unchanged, no update needed.");
  } else {
    if (isForceUpdate) {
      logger.warn("⚠️  Force update enabled, updating Cloudflare DNS record regardless of IP match.");
    }
    logger.info(`🔄 Updating Cloudflare DNS record from ${cloudflareIP} to ${currentIP}...`);
    await updateCloudflareDNS(currentIP);
  }
}

async function main() {
  logger.info("🚀 Starting Cloudflare Dynamic DNS updater...");
  
  validateConfig();

  // Log running mode
  if (isTestMode) logger.info("🧪 Running in test mode - no actual updates will be made");
  if (isForceUpdate) logger.info("⚡ Force update mode enabled");
  if (intervalMinutes > 0) {
    logger.info(`⏰ Running in interval mode - checking every ${intervalMinutes} minutes`);
  }

  await checkAndUpdate();

  // If interval is specified, continue running
  if (intervalMinutes > 0) {
    setInterval(checkAndUpdate, intervalMinutes * 60 * 1000);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('👋 Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('👋 Gracefully shutting down...');
  process.exit(0);
});

// Start the application
main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});