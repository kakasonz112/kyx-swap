import {
  MediaRenderer,
  ThirdwebNftMedia,
  useContract,
  Web3Button,
  useContractRead,
  useContractWrite,
  useAddress,
  useBalance
} from "@thirdweb-dev/react";
import React, { useState, useEffect } from "react";
import Container from "../../../components/Container/Container";
import { GetStaticProps, GetStaticPaths } from "next";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  ETHERSCAN_URL,
  RAFFLES_ADDRESS,
  NETWORK,
  NFT_COLLECTION_ADDRESS,
  CURRENCY_ADDRESS
} from "../../../const/contractAddresses";
import styles from "../../../styles/Token.module.css";
import Link from "next/link";
import randomColor from "../../../util/randomColor";
import Skeleton from "../../../components/Skeleton/Skeleton";
import toast, { Toaster } from "react-hot-toast";
import toastStyle from "../../../util/toastConfig";
import moment from 'moment';
import description from '../../../description/info.json';
import { BigNumber } from "ethers";


type Props = {
  nft: NFT;
  contractMetadata: any;
  eventId: number;
};

const [randomColor1, randomColor2] = [randomColor(), randomColor()];

export default function TokenPage({ nft, contractMetadata, eventId }: Props) {
  const address = useAddress();

  const [raffleValue, setRaffleValue] = useState<number>(1);

  // Load Raffle
  const { contract: raffles } = useContract(RAFFLES_ADDRESS);
  const { data: raffle, isLoading: loadRaffles, error: errorRaffles } = useContractRead(
    raffles, 
    "raffles",
    [eventId],
  );

  // Load Wallet Entries Count
  const { data: userEntry, isLoading: loadUserEntry, error: errorUserEntry } = useContractRead(
    raffles, 
    "getPlayersEntriesCount",
    [eventId, address],
  );

  // Load Player Entries Count
  const { data: raffleEntry, isLoading: loadRaffleEntry, error: errorRaffleEntry } = useContractRead(
    raffles, 
    "getPlayers",
    [eventId],
  );

    // Load AGC Balance
    const { data: agcBalance, isLoading: loadAGC } = useBalance('0x5A1B6A5095063292541014E11cD2056DE3d1813D');
    
  // convert epoch to date
  function convertEpoch (epoch: any) {
    var d = new Date(0); 
    d.setUTCSeconds(epoch);
    return d.toString();
  }
  
  const handleChange = (e: any) => {
    setRaffleValue(Number(e.target.value));
  }

  const incNum =()=>{
      setRaffleValue(raffleValue + 1);
  };
  const decNum = () => {
    if(raffleValue > 1)
      setRaffleValue(raffleValue - 1);
  }

  const calcCost = (amt: number, rafCost: number) => {
    let value = amt * rafCost;
    return value;
  }

  // Approve function for ERC20
  const { contract: token } = useContract(CURRENCY_ADDRESS);
  const { mutateAsync: apprToken, isLoading: loadApprToken, error: errorApprToken } = useContractWrite(
    token,
    "approve",
  );

  // Buy Raffle ticket function
  const { mutateAsync: sendToken, isLoading: loadSendToken, error: errorSendToken } = useContractWrite(
    raffles,
    "buyTicket",
  );



  async function buyRaffle(amtOfTix: number, totalTixCost: number) {

    let txResult, apprResult;

    try {
      var data = await token?.erc20.allowanceOf(address || '', RAFFLES_ADDRESS);
      console.log("Current Allowance: "+data?.value);
      // 1. Check for spending
      if (Number(data?.value) < totalTixCost) {
        console.log("Need more Allowance");
      // 1.1 Approve Spending
        apprResult = await apprToken ({args: [RAFFLES_ADDRESS,''+totalTixCost]});

        if (apprResult) {
          toast(`Allowance Approved!`, {
            icon: "✅",
            position: "bottom-center",
          });
        }
        else {
          toast(`Allowance failed.`, {
            icon: "❌",
            position: "bottom-center",
          });
        }
      }
      else {
        console.log("Allowance Okay");
      }

    }catch(e) {

    } finally {
      // To call raffle buy ticket 
        txResult = await sendToken ({args: [eventId,''+amtOfTix, ''+totalTixCost]});
    
    }

    return txResult;
  }
  // Countdown timer for auction
  const calculateTimeLeft = () => {

    let timeLeft: any = {};

    let auctionEnd = (raffle?.endTimeEpoch.toNumber()) * 1000;
    let now = moment.now();

      const difference = auctionEnd - now;
  
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
    setTimeout(async() => {
      setTimeLeft(await calculateTimeLeft());
    }, 1);

    
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
              <p className={styles.description}>
                {
                  // @ts-ignore 
                  nft.metadata.description
                }
              </p>

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
            <h1 className={styles.title}>Raffles #{eventId}</h1>

            <div
              className={styles.nftOwnerContainer} style={{cursor: 'default'}}
            >
              {/* Random linear gradient circle shape */}
              <div
                className=''
              />
              <div className={styles.nftOwnerInfo}>
                <div className={styles.label}>CountDown</div>
                <div className={styles.nftOwnerAddress}>

                  {
                    loadRaffles ? 
                      <Skeleton width="100%" height="100%" />
                    : timerComponents?.length == 0 ?
                      <span>End</span>  
                      :
                      timerComponents 
                  }
                </div>
              </div>
            </div>

            <div className={styles.pricingContainer}>
              <div className={styles.pricingInfo}>
                {
                  loadRaffles ? 
                    <Skeleton width="100%" height="100%" />
                  :
                  <>
                    <p className={styles.label}>Total Raffle Entries: </p>
                    <div className={styles.pricingValue}>
                      {raffle?.totalEntries.toNumber()}
                    </div>

                    <p className={styles.label}>Total Participants: </p>
                    <div className={styles.pricingValue}>
                      {raffleEntry?.length}
                    </div>

                    <p className={styles.label}>Raffle Cost: </p>
                    <div className={styles.pricingValue}>
                      {Number(raffle?.raffleCost) / 1000000000000000000 } {agcBalance?.symbol} 
                    </div>
                  </>
                }
          
              </div>

              <div className={styles.pricingInfo}>
                <p className={styles.label}>Current Wallet Entries: </p>
                <div className={styles.pricingValue}>
                  {
                  loadUserEntry ? 
                    <Skeleton width="100%" height="100%" />
                  : 
                    userEntry?.toNumber() == null ?
                     <>
                      0
                     </>
                    :
                      userEntry?.toNumber()
                  }
                  
                </div>
              </div>
            </div>

            <div className={styles.balance}>
              Balance: {Number(agcBalance?.value) / 1000000000000000000} {agcBalance?.symbol}
            </div>

            {
              loadRaffles ? 
              <Skeleton width="100%" height="100%" />
              :

              raffle?.raffleStatus && timerComponents.length!=0 ? 
              <>
                <div className={styles.ticketCounter}>
                  <button type="button" className={styles.btn} onClick={decNum} > - </button>
                    <input
                    className={styles.input}
                    min={1}
                    pattern="[^0-9]*"
                    type="number"
                    value={raffleValue}
                    onChange={handleChange}
                    />
                  <button type="button" className={styles.btn} onClick={incNum} > + </button>
                </div>
                <Web3Button
                  contractAddress={RAFFLES_ADDRESS}
                  action={async () => await buyRaffle(raffleValue, await calcCost(raffleValue, Number(raffle?.raffleCost)))}
                  className={styles.btn}
                  onSuccess={() => {
                    toast(`${raffleValue}x Raffle Bought!`, {
                      icon: "✅",
                      position: "bottom-center",
                    });
                  }}
                  onError={(e) => {
                    toast(`Purchase failed.`, {
                      icon: "❌",
                      position: "bottom-center",
                    });
                  }}
                >
                  Buy Raffle
                </Web3Button>
              </>
              : 
                  <div style={{wordBreak: 'break-all', lineHeight: '1rem'}}>
                    <div className={styles.pricingContainer} style={{backgroundColor: '#e55743'}}>
                      <div className={styles.pricingInfo}>
                        <p className={styles.label}>Winner</p>
                        <div className={styles.pricingValue}>

                        {
                        raffle?.winner == '0x0000000000000000000000000000000000000000' ? 
                          <>
                            winner not pick yet
                          </>
                        :
                          raffle?.winner
                        }
                        </div>
                        <p>Raffle has Ended</p>

                      </div>
                    </div>


                    <p></p>
                  </div>

            }


          </div>


        </div>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const eventId = context.params?.eventId as string;
  const sdk = new ThirdwebSDK(NETWORK, 
    {
      clientId: "be9cdb5018fb8339b6bd84a52ef0471b",
      secretKey: 'AyVcg6XH3YG4cadl2voRkhZx-oNftck799h5tqynBSblHYp4eSoSpZH83d1PS1cCKjg6I-_UXef-ghcXE1MMZw',
    }
  );


  const contract = await sdk.getContract(NFT_COLLECTION_ADDRESS);
  const raffles = await sdk.getContract(
    RAFFLES_ADDRESS
  );
  let contractMetadata;
  const raffle = await raffles?.call (
    'raffles',
    [eventId]
  );
  
  const nft = await contract.erc721.get(raffle?.tokenId.toNumber());

  try {
    //contractMetadata = await contract.metadata.get();
  } catch (e) {}

  return {
    props: {
      nft,
      contractMetadata: contractMetadata || null,
      eventId,
    },
    revalidate: 1, // https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
  };
};

export const getStaticPaths: GetStaticPaths = async () => {

  const sdk = new ThirdwebSDK(NETWORK, 
    {
      clientId: "be9cdb5018fb8339b6bd84a52ef0471b",
      secretKey: 'AyVcg6XH3YG4cadl2voRkhZx-oNftck799h5tqynBSblHYp4eSoSpZH83d1PS1cCKjg6I-_UXef-ghcXE1MMZw',
    }
  );

  const raffles = await sdk.getContract(
    RAFFLES_ADDRESS,
  );

  const totalEvent = await raffles?.call (
    'eventId',
  );

  const listing = Array.from({length: totalEvent?.toNumber()}, (_, i) => i + 1);

  const paths = await listing.map((listing) => {
    return {
      params: {
        contractAddress: RAFFLES_ADDRESS,
        eventId: listing.toString(),
      },
    };
  });

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};
