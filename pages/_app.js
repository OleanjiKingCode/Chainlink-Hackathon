import '../styles/globals.css'
import Head from 'next/head'
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
      <Head>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
      </link>
      <title>Hackathon</title>
        <meta name="description" content="Oleanji-Hackathon-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='container-fluid'>
        <div className='row'>
          
          <div className='d-inline-flex p-3 m-10 bd-highlight justify-content-between align-items-center' style={{backgroundColor:"#ff9a8a"}} >
            <Link href="/">
              <a  className={styles.first} >
                <div className=' d-flex align-items-center text-align-center text-grey font-weight-bold'>
                  <h3>OLEANJI CHAINLINK HACKATHON</h3>
                </div>
              </a>
            </Link>
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
     
          <div className='col-md-3 text-white' style={{backgroundColor:" #ff9a8a", height:"589px",position:"relative", overflow:"hidden"}}>
            <Link href="/">
              <div className=' d-flex justify-content-center p-4 mx-5 '>
                Home
              </div>
            </Link>
            <Link href="/voting-poll">
              <div className=' d-flex justify-content-center  p-4 mx-5'>
                Voting
              </div>
            </Link>
            <Link href="/lottery">
              <div className='d-flex justify-content-center  p-4 mx-5'>
                Lottery
              </div>
            </Link>
            <Link href="/meet-up">
              <div className=' d-flex justify-content-center p-4 mx-5'>
                Meet Up
              </div>
            </Link>
            <Link href="/news">
              <div className='d-flex justify-content-center p-4 mx-5'>
                News
              </div>
            </Link>
            {
              account === OwnersAddress && (
                
                <Link href="/all-members">
                  <div className=' d-flex justify-content-center p-4 mx-5'>
                    All Members
                  </div>
                </Link>
              
              )
            }
          </div>
          <div className='col-md-9 d-inline-flex justify-content-center align-self-center'>
            <OwnersAccount.Provider value={account}>
            <Component {...pageProps}  />
            </OwnersAccount.Provider>
          </div>
          
        </div>
        
      </div>
     
    </div>
    
  ) 
}

export default MyApp
