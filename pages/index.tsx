import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Profile.module.css";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Container from "../components/Container/Container";
import Skeleton from "../components/Skeleton/Skeleton";
import { ParallaxProvider } from "react-scroll-parallax";
import { AdvancedBannerTop } from "../components/AdvancedBanner";
import LoadingSpinner from "../components/Spinner/Spinner";
import { BigNumber } from "ethers";
import { useAccount, useBalance, useNetwork, useSignMessage, useSwitchNetwork, useSendTransaction, usePrepareSendTransaction } from 'wagmi'
import { ethers, utils } from 'ethers';
import { serialize, deserialize } from 'wagmi'

const Home: NextPage = () => {
  const [networkId, setNetworkId] = useState<number>(5);
  const [toNetwork, setToNetwork] = useState<number>(5);

  const router = useRouter();
  const [tab, setTab] = useState<"all" | "reload">("all");
  const { address, isConnecting, isDisconnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    address: address,
  })
  const { chains, error, pendingChainId, switchNetwork } =
  useSwitchNetwork()


  const messageToSign = 'This is a Test message';

  const { data, isLoading, isError, signMessage } = useSignMessage({
    message: messageToSign,
  });

  const changeNetwork = (selectNetwork: any) => {
      // switchNetwork?.(selectNetwork.value);
      console.log(selectNetwork);

  }

  const options1 = chains.map((option) => {
    return <option value={option.id} onChange={()=> setNetworkId(option.id)}>{option.name}</option>
  })

  const options2 = chains.map((option) => {
    return <option value={option.id} onChange={()=> setToNetwork(option.id)}>{option.name}</option>
  })

  useEffect(() => {
    switchNetwork?.(networkId);
  }, [networkId]) 

  const { config } = usePrepareSendTransaction({
    to: "0x8531a5aB847ff5B22D855633C25ED1DA3255247e",
    value: BigInt(10000000000000000),
  })

  const { data: sendTx, isLoading: loadSendTx, isSuccess, sendTransaction } =
  useSendTransaction(config);

  if (isLoading) return <p>Please confirm on your wallet...</p>;
  if (isError) return <p>Could not sign the message</p>;

  const reloadPage = () => {
    window.location.reload();
}
  return (
  <>
    <Container maxWidth="lg">
      <div className={styles.profileHeader}>

      </div>

      <div className={styles.tabs}>
        <h3
          className={`${styles.tab}
        ${tab === "all" ? styles.activeTab : ""}`}
          onClick={() => setTab("all")}
        >
          Swap
        </h3>

        <h3
          className={`${styles.tab}
        ${tab === "reload" ? styles.activeTab : ""}`}
          onClick={() => reloadPage()}
        >
          <svg fill="#000000" height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.533 489.533" style={{width: '15px', height: '15px'}}>
          <g>
            <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9
              l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6
              c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6
              C49.575,418.961,150.875,501.261,268.175,488.161z"/>
          </g>
          </svg>
        </h3>

      </div>

      <div
        className={`${
          tab === "all" ? styles.activeTabContent : styles.tabContent
        }`}
        style={{display: 'flex', flexDirection: 'column', gap: '0'}}
      >
          <p>Wallet: {address}</p>
          <p>Type: {connector?.name}</p> 
          <p>Chain Name: {chain?.name}</p>
          <p>Chain Id: {chain?.id}</p>
          <p>Balance: {Number(balance?.formatted).toFixed(4)} {balance?.symbol}</p>
          <div style={{marginBottom: '10px'}}>
            <button disabled={!signMessage} onClick={() => signMessage()} className={styles?.button}>
              Sign message
            </button>
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            From: {networkId}
            <select onChange={(e) => setNetworkId(Number(e.target.value))}>
              {options1}
            </select>
            {/* To: {toNetwork}
            <select onChange={(e) => setToNetwork(Number(e.target.value))}>
              {options2}
            </select> */}
            <div style={{marginBottom: '10px'}}>
            <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
              SwapToZETA
            </button>
          </div>
          </div>

          <br></br>

        <div>

        </div>
      </div>

    </Container>
  </>
  );
};

export default Home;
