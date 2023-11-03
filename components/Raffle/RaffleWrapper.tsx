import { 
  useContract, 
  useNFT, 
  MediaRenderer, 
  Address, 
  ThirdwebNftMedia, 
  useContractRead,
  useBalance,
} from "@thirdweb-dev/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { RAFFLES_ADDRESS, NFT_COLLECTION_ADDRESS } from "../../const/contractAddresses";
import styles from "../../styles/Raffles.module.css";
import styles2 from "../../styles/Buy.module.css";
import Skeleton from "../Skeleton/Skeleton";
import { BigNumber } from "ethers";
import { NFT } from "@thirdweb-dev/sdk";
import moment from 'moment';


type Raffle = {
  raffleId: BigNumber;
  raffleStatus: boolean;
  nftContract: string;
  tokenId: BigNumber;
  totalEntries: BigNumber;
  raffleCost: BigNumber;
  raffleCurrency: string;
  winner: string;
  endTimeEpoch: BigNumber;
};



type Props = {
  eventId: number;
};


export default function ListingWrapper({ eventId }: Props) {

  const { data: agcBalance, isLoading: loadAGC } = useBalance('0x5A1B6A5095063292541014E11cD2056DE3d1813D');

  const { contract: nftAddr } = useContract(NFT_COLLECTION_ADDRESS);

  const { contract: raffles } = useContract(RAFFLES_ADDRESS);

  const { data: raffle, isLoading: loadRaffles, error: errorRaffles } = useContractRead(
    raffles, 
    "raffles",
    [eventId],
  );

  // Countdown timer for auction
  const calculateTimeLeft = () => {
    let raffleEnd = (raffle?.endTimeEpoch.toNumber()) * 1000;
    let now = moment.now();

    const difference = raffleEnd - now;
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
  
    return timeLeft;
  };

  const [timeLeft, setTimeLeft]:any = useState(calculateTimeLeft());

    useEffect(() => {
      setTimeout(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
    });
    
    const timerComponents: any = [];
    
    Object.keys(timeLeft).forEach((interval, index) => {
      if (!timeLeft[interval]) {
        return;
      }
    
      timerComponents.push(
        <span key={index}>
          {timeLeft[interval]} {interval}{" "}
        </span>
      );
    });


  const { data: nft, isLoading } = useNFT(nftAddr, raffle?.tokenId?.toNumber());
  if (isLoading) {
    return (
      <></>
    );
  }

  if (!nft) return null;


  return (
    <div key={raffle.raffleId?.toNumber()}>
    
    <button className={styles2.button} style={{minWidth: '300px'}}>

    <ThirdwebNftMedia metadata={nft.metadata} className={styles.nftImage} key={raffle.tokenId.toNumber()} />
      <p className={styles.nftName}>Raffle #{raffle.raffleId?.toNumber()}</p>

      <div className={styles.priceContainer} >
        <div className={styles.nftPriceContainer}>
          <div>
            <p className={styles.nftPriceLabel}>Status</p>
            <p className={styles.nftPriceValue}>
            {
            raffle.raffleStatus ? 

                <span className={styles.statusDot1} data-status="live"> </span>

            :
                <span className={styles.statusDot2} data-status="end"></span>
            }

            </p>
          </div>
        </div>
      </div>

      <div className={styles.priceContainer} >
        <div className={styles.nftPriceContainer}>
          <div>
            <p className={styles.nftPriceLabel}>End-Time</p>
            <p className={styles.nftPriceValue}>
            {
            timerComponents.length ? 
            timerComponents 
            : 
            <span>Ended</span>
            }

            </p>
          </div>
        </div>
      </div>

      <div className={styles.priceContainer}>
        <div className={styles.nftPriceContainer}>
          <div>
            <p className={styles.nftPriceLabel}>Total Entries</p>
            <p className={styles.nftPriceValue}>
              {
              //@ts-ignore 
              raffle.totalEntries.toNumber()
              }
            </p>
          </div>              
        </div>
      </div>

      <div className={styles.priceContainer}>
        <div className={styles.nftPriceContainer}>
          <div>
            <p className={styles.nftPriceLabel}>Raffle Cost</p>
            <p className={styles.nftPriceValue}>
              {
              //@ts-ignore 
              Number(raffle.raffleCost) / 1000000000000000000 
              } { agcBalance?.symbol }
            </p>
          </div>              
        </div>
      </div>

      <div className={styles.priceContainer}>
        <div className={styles.nftPriceContainer}>
          <div>
            <p className={styles.nftPriceLabel}>Winner</p>
            <p className={styles.nftPriceValue}>
              {
              //@ts-ignore 
              raffle.winner.slice(0, 8)}...{raffle.winner.slice(-4)
              }
            </p>
          </div>              
        </div>
      </div>
      
      <div className={styles2.button__horizontal}></div>
      <div className={styles2.button__vertical}></div>
    </button>
    </div>
  );
}
