import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import React, { useEffect, useRef, useState } from 'react';
import { BigNumber, Contract, providers, utils } from "ethers";
import {
  nftAbi,
  nftAddress,
  tokenAbi,
  tokenAddress,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(
    zero
  );
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [isOwner, setIsOwner] = useState(false);
  const web3ModalRef = useRef();

  
  const getTokensToBeClaimed = async () => {
    try {
      
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        nftAddress,
        nftAbi,
        provider
      );
      const tokenContract = new Contract(
        tokenAddress,
        tokenAbi,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
       
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };

 
  const getBalanceOfCryptoDevTokens = async () => {
    try {
     
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        tokenAddress,
        tokenAbi,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfCryptoDevTokens(zero);
    }
  };

  
  const mintCryptoDevToken = async (amount) => {
    try {
      
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        tokenAddress,
        tokenAbi,
        signer
      );
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

 
  const claimCryptoDevTokens = async () => {
    try {
      
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        tokenAddress,
        tokenAbi,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalTokensMinted = async () => {
    try {
      
      const provider = await getProviderOrSigner();
      // Create an instance of token contract
      const tokenContract = new Contract(
        tokenAddress,
        tokenAbi,
        provider
      );
      // Get all the tokens that have been minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getOwner: gets the contract owner by connected address
   */
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(tokenAddress, tokenAbi, provider);
      // call the owner function from the contract
      const _owner = await tokenContract.owner();
      // we get signer to extract address of currently connected Metamask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to signer which is connected to Metamask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

 
  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        tokenAddress,
        tokenAbi,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
    }
  }

  
  const getProviderOrSigner = async (needSigner = false) => {
    
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

   

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
     
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  
  useEffect(() => {
    if (!walletConnected) {
     
      web3ModalRef.current = new Web3Modal({
        network: "matic",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
      withdrawCoins();
    }
  }, [walletConnected]);

  
  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className={styles.button1} onClick={withdrawCoins}>
            Withdraw Coins
          </button>
        </div>
      );
    }
    // If tokens to be claimed are greater than 0, Return a claim button
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // If user doesn't have any tokens to claim, show the mint button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title> Tech Bull</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Tech Bulls ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Tech Bull tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto
                Dev Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./19.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Piyush Tale
      </footer>
    </div>
  );
}