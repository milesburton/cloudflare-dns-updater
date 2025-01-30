import { config } from "dotenv";
import { fetch } from "bun";
import pino from "pino";

config();

const logger = pino();

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.ZONE_ID;
let RECORD_ID: string | undefined = process.env.RECORD_ID;
const DOMAIN = process.env.DOMAIN;
const CHECK_IP_SERVICE = process.env.CHECK_IP_SERVICE;

const args = process.argv.slice(2);
const isTestMode = args.includes("--test");

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

async function main() {
  logger.info("🚀 Starting Cloudflare Dynamic DNS updater...");
  const currentIP = await getCurrentIP();
  if (!currentIP) return;

  const cloudflareIP = await getCloudflareDNSRecord();
  if (cloudflareIP === currentIP) {
    logger.info("✅ IP address unchanged, no update needed.");
  } else {
    logger.info(`🔄 IP has changed from ${cloudflareIP} to ${currentIP}, updating...`);
    await updateCloudflareDNS(currentIP);
  }
}

main();
