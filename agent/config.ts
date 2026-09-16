import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(__dirname, "../app/.env.local") });

export const config = {
  rpcEndpoint:
    process.env.SOLANA_RPC_ENDPOINT ||
    "https://api.mainnet-beta.solana.com",
  agentWalletPrivateKey: process.env.AGENT_WALLET_PRIVATE_KEY || "",
  meteoraPoolAddress: process.env.METEORA_POOL_ADDRESS || "",
  featureFlagExecution: process.env.FEATURE_FLAG_EXECUTION === "true",
  swapThresholdBps: parseInt(process.env.SWAP_THRESHOLD_BPS || "50"),
  maxTradeAmount: parseInt(process.env.MAX_TRADE_AMOUNT || "1000"),
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || "",
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
  pollIntervalMs: 10_000,
  engineBaseUrl: "http://localhost:3000",
};
