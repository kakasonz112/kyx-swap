import {
  ThirdwebNftMedia,
  useContract,
  useAuctionWinner,
  useEnglishAuctions,
  useValidEnglishAuctions,
  useEnglishAuction

} from "@thirdweb-dev/react";
import { NFT } from "@thirdweb-dev/sdk";
import React from "react";
import {
  MARKETPLACE_ADDRESS,
  NFT_COLLECTION_ADDRESS,
} from "../../const/contractAddresses";
import Skeleton from "../Skeleton/Skeleton";
import styles from "./NFT.module.css";
import { useEffect, useState } from "react";
import moment from 'moment';

type Props = {
  nft: NFT;
  listingId: string;

};

  // convert date to epoch format
  function epoch (date: any) {
    var d = new Date(date);
    var timestamp = Math.floor(d.getTime()/1000.0)
    return timestamp;
  }

function getStatus(status: number ) {
/*
  UNSET = 0,
  Created = 1,
  Completed = 2,
  Cancelled = 3,
  Active = 4,
  Expired = 5,
*/

  switch(status) {
    case 1:
      return "Active";
    case 2:
      return "Completed";
    case 3:
      return "Cancelled";
    case 4:
      return "Active";
    case 5:
      return "Expired";
  }
}


export default function NFTComponent({ nft, listingId }: Props) {
  const { contract: marketplace, isLoading: loadingContract } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace-v3"
  );

  // 1. Load listing from ActiveListings
  const { data: auctionListing, isLoading: loadingAuction } =
  useValidEnglishAuctions(marketplace, {
      tokenContract: NFT_COLLECTION_ADDRESS,
      tokenId: `${nft.metadata.id}`,
    });

  // 2. Load listing from All Listings
  const { data: auctionListings, isLoading: loadingAuctions } =
  useEnglishAuction(marketplace, listingId);

  const { data: auctionWinner, isLoading: loadAuctionWinner } =
  useAuctionWinner(marketplace, listingId);

  function getWinner() {
    return auctionWinner;
  }
  

  // Countdown timer for auction
  const calculateTimeLeft = () => {
    // @ts-ignore
    let auctionEnd = (auctionListings?.endTimeInSeconds) * 1000;
    let now = moment.now();
    const difference = auctionEnd - now;
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
  const [year] = useState(new Date().getFullYear());
  
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

// convert epoch to date
function convertEpoch (epoch: any) {
  var d = new Date(0); 
  d.setUTCSeconds(epoch);
  return d.toString();
}

  return (
    <div key={auctionListings?.id}>
      <ThirdwebNftMedia metadata={nft.metadata} className={styles.nftImage} key={nft.metadata.id} />
      <p className={styles.nftName}>{nft.metadata.name}</p>

      <div className={styles.priceContainer} >
        {loadingContract || loadingAuction || loadingAuctions ? (
          <Skeleton width="100%" height="100%" />
        ) : auctionListings ? (
          
          <div className={styles.nftPriceContainer}>
            <div>
              <p className={styles.nftPriceLabel}>Buyout Price</p>
              <p className={styles.nftPriceValue}>

                {
                   // @ts-ignore
                `${auctionListings?.buyoutBidAmount/1000000000000000000}
                ${auctionListings?.buyoutCurrencyValue.symbol}`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.nftPriceContainer}>
            <div>
              <p className={styles.nftPriceLabel}>Price</p>
              <p className={styles.nftPriceValue}>Sold Out</p>
            </div>
          </div>
            
        )}
      </div>
      <div className={styles.priceContainer}>
        {loadingContract || loadingAuction || loadingAuctions ? (
          <Skeleton width="100%" height="100%" />
        ) : auctionListings && (auctionListings?.status == 4 || auctionListings?.status == 1) ? (


            <div className={styles.nftPriceContainer}>
              <div>
                <p className={styles.nftPriceLabel}>CountDown</p>
                <p className={styles.nftPriceValue}>
                {
                timerComponents.length ? 
                timerComponents 
                : 
                (timerComponents.length==0) ?          
                <Skeleton width="120" height="24" />
                :
                <span>End</span>
                }

                </p>
              </div>
            </div>


        ) : <></>
        }
      </div>
      <div className={styles.priceContainer}>
        {loadingContract || loadingAuction || loadingAuctions ? (
          <Skeleton width="100%" height="100%" />
        ) : auctionListings ? (
            <div className={styles.nftPriceContainer}>
              <div>
                <p className={styles.nftPriceLabel}>Status</p>
                <p className={styles.nftPriceValue}>
                {
                timerComponents.length ? 
                  <>
                    <span className={styles.statusDot1} data-status="live"></span>  {getStatus(auctionListings?.status)}

                  </>
                :
                  <>
                    <span className={styles.statusDot2} data-status="end"></span> {getStatus(auctionListings?.status)}
                  </>
                }
                  {
                  //@ts-ignore 
                  
                  }
                </p>
              </div>              
            </div>
              
        ) : <></>
        }
      </div>

      <div className={styles.priceContainer}>
        {loadingContract || loadingAuction || loadingAuctions ? (
          <Skeleton width="100%" height="100%" />
        ) :  
            auctionWinner ? 
              <div className={styles.nftPriceContainer}>
                <div>
                  <p className={styles.nftPriceLabel}>Winner</p>
                  <p className={styles.nftPriceValue}>
                    {
                      //@ts-ignore 
                      
                      getWinner(auctionWinner).slice(0, 8)}...{getWinner(auctionWinner).slice(-4)
                    }
                  </p>
                </div>              
              </div>
            :
              <div className={styles.nftPriceContainer}>
                <div>
                  <p className={styles.nftPriceLabel}>Owner</p>
                  <p className={styles.nftPriceValue}>
                    {
                      //@ts-ignore 
                      getStatus(auctionListings?.status) == 'Active' ? 
                      <>None</>
                      :
                      <>
                      {
                        //@ts-ignore 
                        nft.owner.slice(0, 8)}...{nft.owner.slice(-4)
                      }
                      </>




                    }
                  </p>
                </div>              
              </div>
                
      
        }
      </div>
    </div>
  );
}
