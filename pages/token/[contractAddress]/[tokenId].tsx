import {
  MediaRenderer,
  ThirdwebNftMedia,
  useContract,
  useContractEvents,
  useValidEnglishAuctions,
  Web3Button,
  useEnglishAuctionWinningBid,
  useMinimumNextBid,

} from "@thirdweb-dev/react";
import React, { useState, useEffect } from "react";
import Container from "../../../components/Container/Container";
import { GetStaticProps, GetStaticPaths } from "next";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  ETHERSCAN_URL,
  MARKETPLACE_ADDRESS,
  NETWORK,
  NFT_COLLECTION_ADDRESS,
} from "../../../const/contractAddresses";
import styles from "../../../styles/Token.module.css";
import Link from "next/link";
import randomColor from "../../../util/randomColor";
import Skeleton from "../../../components/Skeleton/Skeleton";
import toast, { Toaster } from "react-hot-toast";
import toastStyle from "../../../util/toastConfig";
import moment from 'moment';

type Props = {
  nft: NFT;
  contractMetadata: any;
};

const [randomColor1, randomColor2] = [randomColor(), randomColor()];

export default function TokenPage({ nft, contractMetadata }: Props) {
  const [bidValue, setBidValue] = useState<string>();
  const [bidList, setBidList] = useState<{}[]>();

  // Connect to NFT Collection smart contract
  const { contract: nftCollection } = useContract(NFT_COLLECTION_ADDRESS);

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

  // Load historical new bid events
  const { data: bidEvents, isLoading: loadingBidEvents } =
    useContractEvents(marketplace, "NewBid", {
      queryFilter: {
        filters: {
          auctionId: auctionListing?.[0]?.id,
        },
        order: "desc",
      },
    },
    );

    useEffect(() => { 
      var arr = [];
      // @ts-ignore
      for (let i=0; i<bidEvents?.length; i++) {
          if (bidEvents?.[i].data.auctionId == auctionListing?.[0]?.id) {
              arr.push({bidder: bidEvents?.[i]?.data?.bidder, bidderAmt: bidEvents?.[i]?.data.bidAmount});
          }
        }
      setBidList(arr);
    }, [loadingBidEvents]);

  // Load historical transfer events: TODO - more event types like sale
  const { data: transferEvents, isLoading: loadingTransferEvents } =
    useContractEvents(nftCollection, "Transfer", {
      queryFilter: {
        filters: {
          tokenId: nft.metadata.id,
        },
        order: "desc",
      },
    });
  
  // Get current winning bid
  const {
    data: winningBid,
    isLoading: loadingWinning,
    error: winningError,
  } = useEnglishAuctionWinningBid(marketplace, auctionListing?.[0]?.id);
  //console.log("winningBID: "+(winningBid?.bidAmount/1000000000000000000));

  // Load Minimum Next Auction Bid
  const { 
    data: minBid, 
    isLoading: loadingMin, 
    error: minError 
  } = useMinimumNextBid(marketplace, auctionListing?.[0]?.id);

  //console.log("min bid: " +(minBid?.displayValue));
  // Get Next bidAmount
  function getNextBid(bid: any) {
    if (bid == undefined || null || NaN) {
      // @ts-ignore
      nextBid = parseInt(auctionListing?.[0]?.minimumBidAmount);
      nextBid = nextBid / 1000000000000000000;
    }
    else {
      var nextBid = parseInt(bid);
      nextBid += 1000000000000000000;
      nextBid = nextBid / 1000000000000000000;
    }

    return nextBid;
  }
  
  // convert epoch to date
  function convertEpoch (epoch: any) {
    var d = new Date(0); 
    d.setUTCSeconds(epoch);
    return d.toString();
  }
  
  async function createBidOrOffer() {
    let txResult;
    if (!bidValue) {
      toast(`Please enter a bid value`, {
        icon: "❌",
        style: toastStyle,
        position: "bottom-center",
      });
      return;
    }

    if (auctionListing?.[0]) {
      txResult = await marketplace?.englishAuctions.makeBid(
        auctionListing[0].id,
        bidValue    );
    } else {
      throw new Error("No valid listing found for this NFT");
    }

    return txResult;
  }

  async function buyListing() {
    let txResult;

    if (auctionListing?.[0]) {
      txResult = await marketplace?.englishAuctions.buyoutAuction(
        auctionListing[0].id,
    );
    } else {
      throw new Error("No valid listing found for this NFT");
    }
    return txResult;
  }

  // Countdown timer for auction
  const calculateTimeLeft = () => {
    // @ts-ignore
    let auctionEnd = (auctionListing?.[0]?.endTimeInSeconds) * 1000;
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

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <Container maxWidth="lg">
        <div className={styles.container}>
          <div className={styles.metadataContainer}>
            <ThirdwebNftMedia
              metadata={nft.metadata}
              className={styles.image}
            />

            <div className={styles.descriptionContainer}>
              <h3 className={styles.descriptionTitle}>Description</h3>
              <p className={styles.description}>{nft.metadata.description}</p>

              <h3 className={styles.descriptionTitle}>Traits</h3>

              <div className={styles.traitsContainer}>
              {Array.isArray(nft?.metadata?.attributes) &&
                nft.metadata.attributes.map((trait: any, index: number) => (
                  <div className={styles.traitContainer} key={index}>
                    <p className={styles.traitName}>{trait.trait_type}</p>
                    <p className={styles.traitValue}>
                      {trait.value?.toString() || ""}
                    </p>
                  </div>
                ))}
              </div>
              {
            /*
              <h3 className={styles.descriptionTitle}>History</h3>

            }
              <div className={styles.traitsContainer}>
                {transferEvents?.map((event, index) => (
                  <div
                    key={event.transaction.transactionHash}
                    className={styles.eventsContainer}
                  >
                    <div className={styles.eventContainer}>
                      <p className={styles.traitName}>Event</p>
                      <p className={styles.traitValue}>
                        {
                          // if last event in array, then it's a mint
                          index === transferEvents.length - 1
                            ? "Mint"
                            : "Transfer"
                        }
                      </p>
                    </div>

                    <div className={styles.eventContainer}>
                      <p className={styles.traitName}>From</p>
                      <p className={styles.traitValue}>
                        {event.data.from?.slice(0, 4)}...
                        {event.data.from?.slice(-2)}
                      </p>
                    </div>

                    <div className={styles.eventContainer}>
                      <p className={styles.traitName}>To</p>
                      <p className={styles.traitValue}>
                        {event.data.to?.slice(0, 4)}...
                        {event.data.to?.slice(-2)}
                      </p>
                    </div>

                    <div className={styles.eventContainer}>
                      <Link
                        className={styles.txHashArrow}
                        href={`${ETHERSCAN_URL}/tx/${event.transaction.transactionHash}`}
                        target="_blank"
                      >
                        ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            {
            */
            }
            </div>
          </div>

          <div className={styles.listingContainer}>
            {contractMetadata && (
              <div className={styles.contractMetadataContainer}>
                <MediaRenderer
                  src={contractMetadata.image}
                  className={styles.collectionImage}
                />
                <p className={styles.collectionName}>{contractMetadata.name}</p>
              </div>
            )}
            <h1 className={styles.title}>{nft.metadata.name}</h1>
            <p className={styles.collectionName}>Token ID #{nft.metadata.id}</p>

            <div
              className={styles.nftOwnerContainer} style={{cursor: 'default'}}
            >
              {/* Random linear gradient circle shape */}
              <div
                className=''
                style={{
                  background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
                }}
              />
              <div className={styles.nftOwnerInfo}>
                <p className={styles.label}>Current Owner</p>
                <p className={styles.nftOwnerAddress}>
                  {nft.owner.slice(0, 8)}...{nft.owner.slice(-4)}
                </p>
              </div>
              <div className={styles.nftOwnerInfo}>
                <p className={styles.label}>End Time</p>
                <p className={styles.nftOwnerAddress}>
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

            <div className={styles.pricingContainer}>
              {/* Pricing information */}
              <div className={styles.pricingInfo}>
                <p className={styles.label}>Buyout Price</p>
                <div className={styles.pricingValue}>
                  {loadingContract || loadingAuction ? (
                    <Skeleton width="120" height="24" />
                  ) : (
                    <>
                      {auctionListing && auctionListing[0] ? (
                        <>

                        {
                          // @ts-ignore
                        `${auctionListing[0]?.buyoutBidAmount/1000000000000000000}
                        ${auctionListing[0]?.buyoutCurrencyValue.symbol}`
                        }
                        </>
                      ) : (
                        "Sold Out"
                      )}
                    </>
                  )}
                </div>
   
                <div>
                  {loadingAuction ? (
                    <Skeleton width="120" height="24" />
                  ) : (
                    <>
                      {auctionListing && auctionListing[0] && (
                        <>
                          <p className={styles.label} style={{ marginTop: 12 }}>
                            Bids starting from
                          </p>

                          <div className={styles.pricingValue}>

                          {
                          // @ts-ignore
                          `${auctionListing[0]?.minimumBidAmount/1000000000000000000}
                          ${auctionListing[0]?.buyoutCurrencyValue.symbol}`
                          }
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                  <div>
                    <>
                      {auctionListing && auctionListing[0] && winningBid && (
                        <>
                          <p className={styles.label} style={{ marginTop: 12 }}>
                            Current Highest Bid
                          </p>
                          <div className={styles.pricingValue}>
                            {
                                //@ts-ignore
                                ((winningBid?.bidAmount) / 1000000000000000000)
                                
                            }
                            {" " +
                                auctionListing[0]?.buyoutCurrencyValue.symbol
                            }
          
                            <div style={{fontSize: '12px'}}>
                                {
                                
                                winningBid?.bidderAddress.substring(0,6) + '...' +   winningBid?.bidderAddress.substring(39, 42)
                                
                                }
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  </div>

                  <div>
                    <>
                      {auctionListing && auctionListing[0] && winningBid && (
                        <>
                          <p className={styles.label} style={{ marginTop: 12 }}>
                            Next Min Bid
                          </p>

                          <div className={styles.pricingValue}>
                            {
                                
                                //@ts-ignore
                                minBid?.displayValue
                                  
                            }
                            {" " +
                              auctionListing[0]?.buyoutCurrencyValue.symbol
                            }
                          </div>
                        </>
                      )}
                    </>
                  </div>

                <div>
                    <>
                      {auctionListing && auctionListing[0] && bidEvents && (
                        <>
                          <p className={styles.label} style={{ marginTop: 12 }}>
                            Recent Bidder History
                          </p>

                            {bidList && bidList[0] && auctionListing && auctionListing[0] &&(
                              <>
                                {
                                  loadingBidEvents ? 
                                  <Skeleton width="120" height="24" />
                                  :
                                  bidList?.map((data: any, index: number) => (
                                    <div className={styles.pricingValue}>
                                      <div className={styles.pricingValue} key={index}>
                                      
                                            {
                                            (data?.bidderAmt)/1000000000000000000} {auctionListing[0]?.buyoutCurrencyValue.symbol
                                            }
                                        <div style={{fontSize: '12px'}}>
                                          {
                                            data?.bidder.substring(0,6) + '...' + data?.bidder.substring(39, 42)  
                                          }

                                        </div>
                                      </div>
                                    </div>

                                  ))
                                }
                              
                              </>
                            )}
                        </>
                      )}
                    </>
                </div>

            {
            
            }
              </div>
            </div>

            {loadingContract || loadingAuction ? (
              <Skeleton width="100%" height="164" />
            ) : (
              <>
                {auctionListing && auctionListing[0] && (
                  <>
                    <Web3Button
                      contractAddress={MARKETPLACE_ADDRESS}
                      action={async () => await buyListing()}
                      className={styles.btn}
                      onSuccess={() => {
                        toast(`Purchase success!`, {
                          icon: "✅",
                          style: toastStyle,
                          position: "bottom-center",
                        });
                      }}
                      onError={(e) => {
                        toast(`Purchase failed! Reason: ${e.message}`, {
                          icon: "❌",
                          style: toastStyle,
                          position: "bottom-center",
                        });
                      }}
                    >
                      Buyout
                    </Web3Button>

                    <div className={`${styles.listingTimeContainer} ${styles.or}`}>
                  <p className={styles.listingTime}>or</p>
                </div>

                <input
                  className={styles.input}
                  min={minBid?.displayValue}
                  pattern="[^0-9]*"
                  type="number"
                  step={0.1}
                  onChange={(e) => {
                      setBidValue(e.target.value);
                  }}
                />

                <Web3Button
                  contractAddress={MARKETPLACE_ADDRESS}
                  action={async () => await createBidOrOffer()}
                  className={styles.btn}
                  onSuccess={() => {
                    toast(`Bid success!`, {
                      icon: "✅",
                      position: "bottom-center",
                    });
                  }}
                  onError={(e) => {
                    toast(`Bid failed! Try again.`, {
                      icon: "❌",
                      position: "bottom-center",
                    });
                  }}
                >
                  Place bid
                </Web3Button>
                  </>
                  )}

              </>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const tokenId = context.params?.tokenId as string;

  const sdk = new ThirdwebSDK(NETWORK);

  const contract = await sdk.getContract(NFT_COLLECTION_ADDRESS);

  const nft = await contract.erc721.get(tokenId);

  let contractMetadata;

  try {
    //contractMetadata = await contract.metadata.get();
  } catch (e) {}

  return {
    props: {
      nft,
      contractMetadata: contractMetadata || null,
    },
    revalidate: 1, // https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const sdk = new ThirdwebSDK(NETWORK);

  const contract = await sdk.getContract(NFT_COLLECTION_ADDRESS);

  const nfts = await contract.erc721.getAll();

  const paths = nfts.map((nft) => {
    return {
      params: {
        contractAddress: NFT_COLLECTION_ADDRESS,
        tokenId: nft.metadata.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};
