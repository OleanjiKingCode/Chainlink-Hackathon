import '../styles/globals.css'
import Head from 'next/head'
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers} from "ethers";
import Link from "next/link"
import 'bootstrap/dist/css/bootstrap.css'
import { OwnersAccount } from '../context';
import { useEffect, useRef, useState } from "react";
import { OwnersAddress } from '../constant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function MyApp({ Component, pageProps }) {

  const[account , setAccount] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();


  const getProviderOrSigner = async (needSigner = false) => {
   
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

   
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
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
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);




  return (
    <div>
      <Head>
     
      <title>Hackathon</title>
        <meta name="description" content="Oleanji-Hackathon-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='container-fluid'>
        <div className='row'>
        <div className='col-md-2 text-white p-0' style={{backgroundColor:"#222d32", height:"100vh",position:"relative", overflow:"hidden"}}>
            <Link href="/">
              <a  className={styles.first} >
                <div className='font-weight-bold px-2' style={{flexDirection:"column", color:"#b8c7ce", fontSize:"22px"}}>
                  <p>OLEANJI CHAINLINK HACKATHON</p>
                </div>
              </a>
            </Link>
            <div className='p-1 text-align-center my-3 ' style={{backgroundColor:"#1a2226"}}>
              <div style={{color:"white", fontSize:"12px"}}>
                Main Navigation
              </div>
            </div>
            <Link href="/" >
              {/* <div className='py-4 px-3 mx-10'> */}
                <div className={styles.hover}>
                 Home
                </div>
               
              {/* </div> */}
            </Link>
            <Link href="/voting-poll">
              <div className={styles.hover}>
                Voting
              </div>
            </Link>
            <Link href="/chat-room">
              <div className={styles.hover}>
                Chat Room
              </div>
            </Link>
            <Link href="/Mint">
              <div className={styles.hover}>
                NFT&apos;s
              </div>
            </Link>
            
            
            {
              account === OwnersAddress && (
                
                <Link href="/all-members">
                  <div className={styles.hover}>
                    All Members
                  </div>
                </Link>
              
              )
            }
            <div className='my-5 mx-2' style={{fontWeight:"700"}}>
              IF ERROR FOR ANY REASON PLS RELOAD
            </div>
          </div>
          <div className='col-md-10' style={{backgroundColor:"#f1f1f1"}} >
              <div className='row d-flex align-items-start' style={{flexDirection:"column"}}>
              <div className='col-md-2 d-inline-flex p-4 bd-highlight justify-content-end align-items-center' style={{backgroundColor:"whitesmoke", width:"100%"}} >
            
            {
              !walletConnected && (
                <div>
                  <button className={styles.second} onClick={connectWallet}>
                  
                    <div className='d-inline-block text-truncate p-2'>
                      Connect Wallet </div>
                  </button>
                </div>
              )
            }
          
            {
              
              walletConnected && (
                <div>
                
                  <button className={styles.second}>
                    <div className='d-inline-block p-2 col-6 text-truncate'>
                       {account}
                    </div>
                  </button>
                 
                </div>
              )
            }
          </div>
     
        
          <div className='col-md-10 d-flex justify-content-center mt-2 align-items-center' style={{height:"80vh", width:"100%"}} >
            <OwnersAccount.Provider value={account}>
            <Component {...pageProps}  />
            </OwnersAccount.Provider>
          </div>
              </div>
         
          </div>

          
        </div>
        
      </div>
     
    </div>
    
  ) 
}

export default MyApp
