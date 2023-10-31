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
      clientId="4efe01e1a42b9eb67db008e00ee20394"
      secretKey="gG2NJpvp9U6Ce2f94eefANTxLEi5YHmslmmWxaVtObeua_2HvNq0YytVFtiv27I4FCP9ZjTPOZWoCWtN1lvwcQ"
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
