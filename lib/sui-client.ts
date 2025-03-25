import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client"

// Get the Sui network from environment variables or default to testnet
export const SUI_NETWORK = process.env.SUI_NETWORK || "testnet"
export const SNS_PACKAGE_ID = process.env.SNS_PACKAGE_ID || ""
export const SNS_REGISTRY_ID = process.env.SNS_REGISTRY_ID || ""

/**
 * Creates a Sui client instance for interacting with the Sui blockchain
 * @returns A configured SuiClient instance
 */
export function createSuiClient(): SuiClient {
  // Get the fullnode URL for the specified network
  const fullnodeUrl = getFullnodeUrl(SUI_NETWORK as "testnet" | "mainnet" | "devnet" | "localnet")

  // Create and return a new SuiClient instance
  return new SuiClient({ url: fullnodeUrl })
}

/**
 * Get the explorer URL for a transaction
 * @param txId The transaction ID
 * @returns The explorer URL for the transaction
 */
export function getExplorerUrl(txId: string): string {
  const baseUrl = SUI_NETWORK === "mainnet" ? "https://explorer.sui.io" : `https://explorer.${SUI_NETWORK}.sui.io`

  return `${baseUrl}/txblock/${txId}`
}

/**
 * Get the explorer URL for an object
 * @param objectId The object ID
 * @returns The explorer URL for the object
 */
export function getObjectExplorerUrl(objectId: string): string {
  const baseUrl = SUI_NETWORK === "mainnet" ? "https://explorer.sui.io" : `https://explorer.${SUI_NETWORK}.sui.io`

  return `${baseUrl}/object/${objectId}`
}

