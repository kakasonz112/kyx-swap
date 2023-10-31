/** Replace the values below with the addresses of your smart contracts. */

// 1. Set up the network your smart contracts are deployed to.
// First, import the chain from the package, then set the NETWORK variable to the chain.
import { Goerli, Sepolia, Ethereum } from "@thirdweb-dev/chains";
export const NETWORK = Goerli;

// 2. The address of the marketplace V3 smart contract.
// Deploy your own: https://thirdweb.com/thirdweb.eth/MarketplaceV3
export const MARKETPLACE_ADDRESS = "0x5830b93ea6999d26Da699d946dc4957FF0f346aC";

export const RAFFLES_ADDRESS = "0x764822aD3aA3F43a2a68c975b08AcfB51ADE0E01";

export const CURRENCY_ADDRESS = "0x5A1B6A5095063292541014E11cD2056DE3d1813D";
// 3. The address of your NFT collection smart contract.
export const NFT_COLLECTION_ADDRESS = 
  "0xdd65b4CA6322075D30C060d44364122d0113e3B3";

// (Optional) Set up the URL of where users can view transactions on
// For example, below, we use Mumbai.polygonscan to view transactions on the Mumbai testnet.
export const ETHERSCAN_URL = "https://etherscan.io";

// Goerli Token Address: 0x5A1B6A5095063292541014E11cD2056DE3d1813D
// Sepolia Token Address: 0x935317b6B29CcFEF427b86478e30aD5613a0a009
// AGC Token Address: 