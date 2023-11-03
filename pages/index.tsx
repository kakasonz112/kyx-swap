import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Profile.module.css";
import {
  useContract,
  useValidEnglishAuctions,
  useEnglishAuctions,
  useContractRead

} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Container from "../components/Container/Container";
import ListingWrapper from "../components/ListingWrapper/ListingWrapper";
import RaffleWrapper from "../components/Raffle/RaffleWrapper";
import Skeleton from "../components/Skeleton/Skeleton";
import {
  MARKETPLACE_ADDRESS,
  NFT_COLLECTION_ADDRESS,
  RAFFLES_ADDRESS
} from "../const/contractAddresses";
import { ParallaxProvider } from "react-scroll-parallax";
import { AdvancedBannerTop } from "../components/AdvancedBanner";
import LoadingSpinner from "../components/Spinner/Spinner";
import { BigNumber } from "ethers";

var arr: any[] = [];
var arr2: any[] = [];
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

const Home: NextPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "raffles" | "reload">("all");

  // --------------- //
  // Contract declaration
  const { contract: marketplace } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace-v3"
  );

  const { contract: raffles } = useContract(RAFFLES_ADDRESS);
  // ---------------//

  // Raffles 
  const { data: totalEvent, isLoading: loadRaffles, error: errorRaffles } = useContractRead(
    raffles, 
    "eventId"
  );
  arr = Array.from({length: totalEvent?.toNumber()}, (_, i) => i + 1);

  // ---------------//

  // All listings
  const { data: auctionListings, isLoading: loadingAuctions } =
  useEnglishAuctions(marketplace); 
  // All Active Listings
  const { data: validAuctionListings, isLoading: loadingValidAuctions } =
  useValidEnglishAuctions(marketplace);

  // --------------- //
  const reloadPage = () => {
    window.location.reload();
}
  return (
  <>
    <ParallaxProvider>
      <AdvancedBannerTop />
    </ParallaxProvider>
    <Container maxWidth="lg">
      <div className={styles.profileHeader}>

      </div>

      <div className={styles.tabs}>
        <h3
          className={`${styles.tab}
        ${tab === "all" ? styles.activeTab : ""}`}
          onClick={() => setTab("all")}
        >
          Auctions
        </h3>

        <h3
          className={`${styles.tab}
        ${tab === "raffles" ? styles.activeTab : ""}`}
          onClick={() => setTab("raffles")}
        >
          Raffles
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
      >
        {
          loadingValidAuctions && loadingAuctions ? 
            <LoadingSpinner />
          :
          <div>
              {loadingValidAuctions ? (
                <LoadingSpinner />
              ) : 
              <div className={styles.group}>
                <div className={styles.groupLabel} style={{color: 'rgb(60, 179, 113)'}}> 
                  Available 
                </div>
                {
                  validAuctionListings && validAuctionListings.length === 0 ? (
                    <span>No Auction is Available yet.</span>
                  ) : 
                  (
                    

                    validAuctionListings?.sort((a,b) => a.endTimeInSeconds - b.endTimeInSeconds).map((listing, index) => (
                      <ListingWrapper listing={listing} key={index} />
                    ))
                  )
                }
              </div>
              }

            <div className={styles.group}>
              <div className={styles.groupLabel} style={{color: 'rgba(240, 21, 18, 0.85)'}}> 
                Expired 
              </div>

              {loadingAuctions ? (
                <LoadingSpinner />
              ) : auctionListings && auctionListings.length === 0 ? (
                <span>No Auction is Available yet.</span>
              ) : (
                auctionListings?.map((listing, index) => (

                    validAuctionListings?.some(((listing2, index2) => listing?.id == listing2?.id)) ? 
                      <></>
                    :
                    <ListingWrapper listing={listing} key={index} />

                ))
              )}
            </div>

          </div>

        }
      </div>

      <div
        className={`${
          tab === "raffles" ? styles.activeTabContent : styles.tabContent
        }`}
      >
        {
          loadRaffles ? 
            <LoadingSpinner />
          : 

          <div className={styles.group}>
              <div className={styles.groupLabel} style={{color: 'rgb(60, 179, 113)'}}> 
                Available 
              </div>
            {
              arr.length == 0 ? 
              <span>No Raffles</span>
              : 
                  (
                    arr?.reverse().map((listing, key) => (
                      
                      <Link
                      href={`/raffle/${RAFFLES_ADDRESS}/${listing}`}
                      key={listing}
                      >
                        <RaffleWrapper eventId={listing} key={key}/> 
                        
                      </Link>
                    ))
                  )

            }

          </div>
        }
          
      </div>

    </Container>
  </>
  );
};

export default Home;
