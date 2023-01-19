import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

import Link from 'next/link'
import BackIcon from "../public/icons/BackIcon.png"
import Image from 'next/image'

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const { mutateAsync: claimRewards } = useContractWrite(
    contract,
    "claimRewards"
  );
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  // const { data: stakedTokens } = useContractRead(
  //   contract,
  //   "getStakeInfo",
  //   address
  // );

  const { data: stakedTokens } = useContractRead(
    contract,
    "availableRewards",
    address
  );

  useEffect(() => {
    if (!contract || !address) return;

    //   const { contract } = useContract("0x49DFaAD215FCd76c3B7Cc330aE219E58DF02daA3");
    // const { data, isLoading } = useContractRead(contract, "availableRewards", _staker)

    async function loadClaimableRewards() {
      // const stakeInfo = await contract?.call("getStakeInfo", address);
      const stakeInfo = await contract?.call("availableRewards", address);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [id]);
  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <Link href="/">
        <div className="d-flex">
          {/* <img src={`/icons/BackIcon.png`} alt="" /> */}
          <Image src={BackIcon} className="asad" width={50} height={50} />

          {/* <i className="fa fa-arrow-left" aria-hidden="true"></i> */}
          {/* <i className="fa fa-arrow-left"></i> */}

          <h3>Go To Dashboard</h3>
        </div>
      </Link>
      <div className={styles.container + " " + styles.stakecontainer}>
        <h1 className={styles.h1}>Stake Your NFTs</h1>
        <hr className={`${styles.divider} ${styles.spacerTop}`} />

        {!address ? (
          <ConnectWallet />
        ) : (
          <>
            <h2>Your Tokens</h2>
            <div className={styles.tokenGrid}>
              <div className={styles.tokenItem}>
                <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
                <p className={styles.tokenValue}>
                  <b>
                    {!claimableRewards
                      ? "Loading..."
                      : ethers.utils.formatUnits(claimableRewards, 18)}
                  </b>{" "}
                  {tokenBalance?.symbol}
                </p>
              </div>
              <div className={styles.tokenItem}>
                <h3 className={styles.tokenLabel}>Current Balance</h3>
                <p className={styles.tokenValue}>
                  <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
                </p>
              </div>
            </div>

            <Web3Button
              action={() => claimRewards([])}
              contractAddress={stakingContractAddress}
            >
              Claim Rewards
            </Web3Button>

            <hr className={`${styles.divider} ${styles.spacerTop}`} />
            <h2>Your Staked NFTs</h2>
            <div className={styles.nftBoxGrid}>
              {stakedTokens &&
                stakedTokens[0]?.map((stakedToken: BigNumber) => (
                  <NFTCard
                    tokenId={stakedToken.toNumber()}
                    key={stakedToken.toString()}
                  />
                ))}
            </div>

            <hr className={`${styles.divider} ${styles.spacerTop}`} />
            <h2>Your Unstaked NFTs</h2>
            <div className={styles.nftBoxGrid}>
              {ownedNfts?.map((nft) => (
                <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                    className={styles.nftMedia}
                  />
                  <h3>{nft.metadata.name}</h3>
                  <Web3Button
                    contractAddress={stakingContractAddress}
                    action={() => stakeNft(nft.metadata.id)}
                  >
                    Stake
                  </Web3Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Stake;