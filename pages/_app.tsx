import type { AppProps } from "next/app";
import { Navbar } from "../components/Navbar/Navbar";
import NextNProgress from "nextjs-progressbar";
import "../styles/globals.css";
import Head from 'next/head';
import { ethers } from "ethers";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { goerli, zetachainAthensTestnet, polygonMumbai, bscTestnet } from 'viem/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'


function MyApp({ Component, pageProps }: AppProps) {
  // 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'c03480d94964569827f3b2274285b12b'
const chains = [goerli, zetachainAthensTestnet, polygonMumbai, bscTestnet]

// 2. Create wagmiConfig
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [new WalletConnectConnector({
    options: {
      projectId: projectId
    },
  })],
  
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)




  return (
    <>
    <WagmiConfig config={wagmiConfig}>

      <Head>
        <title>KYEX Swap</title>
        <meta name="KYEX Swap" content='KYEX Swap'></meta>
      </Head>
      {/* Progress bar when navigating between pages */}
      <NextNProgress
        color="var(--color-tertiary)"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
      />

      {/* Render the navigation menu above each component */}
      <Navbar />
      {/* Render the actual component (page) */}
      <Component {...pageProps} />
    </WagmiConfig>
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}

export default MyApp;
