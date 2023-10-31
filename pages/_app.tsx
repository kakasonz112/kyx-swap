import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Navbar } from "../components/Navbar/Navbar";
import NextNProgress from "nextjs-progressbar";
import { NETWORK } from "../const/contractAddresses";
import "../styles/globals.css";
import Head from 'next/head';
import { ethers } from "ethers";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider 
      activeChain={NETWORK} 
      clientId="85c6a9c2c419f39e5efc5d3d0cf390c8"
      secretKey="bVTbKFefu7OjLYubj0EkwbvzJ1Fmp_O7CGlEYUTseZKvH3LIHlNcF6l6nq1kC1p-HKuvpjJWu8f6e4JW0x8N4w"
    >
      <Head>
        <title>AGC Marketplace</title>
        <meta name="Art Tokyo Global" content='AGC Marketplace'></meta>
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
    </ThirdwebProvider>
  );
}

export default MyApp;
