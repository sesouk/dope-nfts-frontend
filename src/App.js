import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import myDopeNft from './utils/MyDopeNFT.json'

// Constants
const TWITTER_HANDLE = 'KevinDevelopin';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/dopenft-zloszkt9ka';
const TOTAL_MINT_COUNT = 50;

const networks = {
  "0x1": "Mainnet",
  "0x3": "Ropsten",
  "0x2a": "Kovan",
  "0x4": "Rinkeby",
  "0x5": "Goerli",
};

const CONTRACT_ADDRESS = "0xB4aA3abEfad2afa5906ab682352535E9A7254744"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("")
  const [totalMinted, setTotal] = useState("")
  const [network, setNetwork] = useState("Not connected")
  const [mining, setMining] = useState("")

  // Render Methods
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    let chainId = await ethereum.request({ method: 'eth_chainId' })
    const rinkebyChainId = '0x4'
    setNetwork(networks[chainId])

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myDopeNft.abi, signer);

    if (!ethereum) {
      console.log("Make sure you have metamask");
      return
    } else {
      console.log("We have the ethereum object", ethereum);
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test network!")
      }
      let totalMinted = await connectedContract.getTotalMinted()
      console.log(totalMinted.toNumber());
      
      setTotal(totalMinted.toNumber())
    }

    
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      

      setupEventListener()
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask!")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])

      setupEventListener()

    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myDopeNft.abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMint = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myDopeNft.abi, signer);

        console.log("Opening wallet to pay gas...");
        let nftTxn = await connectedContract.makeNFT()
        setMining(true)

        console.log("Mining... please wait");
        await nftTxn.wait()
        setMining(false)

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        let totalMinted = await connectedContract.getTotalMinted()
        console.log(totalMinted.toNumber());

        setTotal(totalMinted.toNumber())

      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">
            {totalMinted}/{TOTAL_MINT_COUNT}
          </p>
          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          ) : (
            <button onClick={askContractToMint} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          {network !== "Rinkeby" ? (
            <div style={{ color: "white", paddingTop: "1rem" }}>
              Please connect to the Rinkeby Test Network
            </div>
          ) : (
            <div style={{ color: "white", paddingTop: "1rem" }}>
              Your current network is: {network}
            </div>
          )
        }
          {mining ? (
            <div className="dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
            )
            : null
            }
        </div>
        <div className="footer-container">
          <button className="cta-button connect-wallet-button">
            <a className="aBtn"
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer"
            >
              🌊 View Collection on OpenSea
            </a>  
          </button>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a 
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
