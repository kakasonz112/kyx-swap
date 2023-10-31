import { useContract, useNFT, MediaRenderer } from "@thirdweb-dev/react";
import { AuctionListing, DirectListing, DirectListingV3, EnglishAuction,  } from "@thirdweb-dev/sdk";
import Link from "next/link";
import React from "react";
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from "../../const/contractAddresses";
import styles from "../../styles/Buy.module.css";
import NFT from "../NFT/NFT";
import Skeleton from "../Skeleton/Skeleton";

type Props = {
  listing: DirectListingV3 | EnglishAuction;
};

/**
 * Accepts a listing and renders the associated NFT for it
 */
export default function ListingWrapper({ listing }: Props) {
  const { contract: nftContract } = useContract(NFT_COLLECTION_ADDRESS);

  const { data: nft, isLoading } = useNFT(nftContract, listing.asset.id);
  if (isLoading) {
    return (
      <></>
    );
  }

  if (!nft) return null;

  return (
    <div key={listing.id}>
      <button className={styles.button} style={{minWidth: '300px'}}>
        <Link
          href={`/listing/${MARKETPLACE_ADDRESS}/${listing.id}`}
          key={listing.id}
        >
          <NFT nft={nft} listingId={listing.id}/>
        
          <div className={styles.button__horizontal}></div>
          <div className={styles.button__vertical}></div>
        </Link>
      </button>
    </div>
  );
}
