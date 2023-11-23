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
import tss from "../const/tss.json";
import zrc20 from "../const/zrc20.json";
import chainName from "../const/chains.json"
import { swapContract, prepareData } from "../const/contractAddress";

const Home: NextPage = () => {
  const [networkId, setNetworkId] = useState<number>(5);
  const [toNetwork, setToNetwork] = useState<number>(5);
  const [swapAmount, setSwapAmount] = useState<number>(0.01);

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
    if (option.id != 7001)
    return <option value={option.id} onChange={()=> setNetworkId(option.id)}>{option.name}</option>
  })

  const options2 = chains.map((option) => {
    return <option value={option.id} onChange={()=> setToNetwork(option.id)}>{option.name}</option>
  })

  useEffect(() => {
    switchNetwork?.(networkId);
  }, [networkId]) 


  const { config } = usePrepareSendTransaction({
    // @ts-ignore
    to: tss[`${chain?.id}`],
    value: BigInt(swapAmount*1000000000000000000),
  })

  const { data: sendTx, isLoading: loadSendTx, isSuccess, sendTransaction } =
  useSendTransaction(config);

  function getData(contract: any, zrc20Contract: any, recipient: any) {
    let data1;
    try {
      data1 = prepareData(
        contract,
        ["address", "bytes"],
        [zrc20Contract, recipient]
      );
    } catch (e) {

    }
    return data1 as unknown as `0x${string}`;
  }

  const prepareSWAP = (tokenAddress: string,recipient: any) => {
      const { data: swapHash, sendTransaction: sendSwap } =
      useSendTransaction({
        // @ts-ignore
        data: getData(swapContract, zrc20[toNetwork], address),
        // @ts-ignore
        to:  tss[`${chain?.id}`],
        value: BigInt(swapAmount*1000000000000000000),
      });
    return (
      <div style={{marginBottom: '10px'}}>
        <button disabled={!sendSwap} onClick={() => sendSwap?.()}>
          {/* @ts-ignore */}
          Swap To {chainName[toNetwork]}
        </button>
        <br></br>
        Transaction TXN: {swapHash?.hash}
      </div>
    )
  } 


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
        <Container maxWidth="xs">
          {/* @ts-ignore */}
          TSS: {tss[`${chain?.id}`]} <br></br>
          <div style={{display: 'flex', gap: '10px'}}>
            
            
            From: <br></br>
            <select onChange={(e) => setNetworkId(Number(e.target.value))}>
              {options1}
            </select>
            To: {toNetwork}
            <select onChange={(e) => setToNetwork(Number(e.target.value))}>
              {options2}
            </select>
            <br></br>
          </div>
          <br></br>
          AmountToSwap:
          <input type="number" onChange={(e) => setSwapAmount(Number(e.target.value))} style={{width: '100px'}} defaultValue={0.01}required/>
          <br></br><br></br>
          <div style={{marginBottom: '10px'}}>
            <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
              SwapToZETA
            </button>
          </div>

          {prepareSWAP("0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb", "0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb")}
          { /* @ts-ignore */ }
          <p style={{wordBreak: 'break-word'}}>Data: {getData(swapContract, zrc20[toNetwork], address)}</p>
        </Container>
      </div>

    </Container>
  </>
  );
};

export default Home;
