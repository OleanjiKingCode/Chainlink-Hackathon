import '../styles/globals.css'
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers} from "ethers";
import Link from "next/link"
import { OwnersAccount } from '../context';
import { useEffect, useRef, useState } from "react";
import { LinkTokenAddress, OwnersAddress ,  abi } from '../constant';

function MyApp({ Component, pageProps }) {

  const[account , setAccount] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();


  const getProviderOrSigner = async (needSigner = false) => {
   
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

   
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 42) {
      window.alert("Change the network to Kovan");
      throw new Error("Change network to kovan");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      const acc = await signer.getAddress();
      setAccount(acc);
     
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
     
      await getProviderOrSigner(true);
     
      setWalletConnected(true);
     
      console.log(walletConnected);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "kovan",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);




  return (
    <div>
      <nav>
        <div>
          <Link href="/">
            <a>
              <p>
                OLEANJI CHAINLINK HACKATHON
              </p>
            </a>
          </Link>
          {
            !walletConnected && (
              <div>
                <button onClick={connectWallet}>
                  <p> Connect Wallet </p>
                </button>
              </div>
            )
          }
         
          {
            
            walletConnected && (
              <div>
                <p>
                <button>
                  <p> {account}
                   </p>
                </button>
                </p>
              </div>
            )
          }
        </div>
        <div>
          <Link href="/">
            <p>
              Home
            </p>
          </Link>
          <Link href="/Voting-poll">
            <p>
              Voting
            </p>
          </Link>
          <Link href="/lottery">
            <p>
              Lottery
            </p>
          </Link>
          <Link href="/meet-up">
            <p>
              Meet Up
            </p>
          </Link>
          <Link href="/news">
            <p>
              News
            </p>
          </Link>
          {
            account === OwnersAddress && (
              
              <Link href="/all-members">
                <p>
                  All Members
                </p>
              </Link>
            
            )
          }
        </div>
      </nav>
      <div>
        <OwnersAccount.Provider value={account}>
        <Component {...pageProps}  />
        </OwnersAccount.Provider>
      </div>
    </div>
    
  ) 
}

export default MyApp
