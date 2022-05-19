import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { providers, Contract,ethers } from "ethers";
import { useRouter } from "next/router"
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress } from "../constant"
import { OwnersAccount } from '../context';
// import {Abi } from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json/abi'
import LINK from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json'




export default function Home() {
  // return (
  //   <div className={styles.container}>
  //     <Head>
  //       <title>Create Next App</title>
  //       <meta name="description" content="Generated by create next app" />
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>

  //     <main className={styles.main}>
  //       <h1 className={styles.title}>
  //         Welcome to <a href="https://nextjs.org">Next.js!</a>
  //       </h1>

  //       <p className={styles.description}>
  //         Get started by editing{' '}
  //         <code className={styles.code}>pages/index.js</code>
  //       </p>

  //       <div className={styles.grid}>
  //         <a href="https://nextjs.org/docs" className={styles.card}>
  //           <h2>Documentation &rarr;</h2>
  //           <p>Find in-depth information about Next.js features and API.</p>
  //         </a>

  //         <a href="https://nextjs.org/learn" className={styles.card}>
  //           <h2>Learn &rarr;</h2>
  //           <p>Learn about Next.js in an interactive course with quizzes!</p>
  //         </a>

  //         <a
  //           href="https://github.com/vercel/next.js/tree/canary/examples"
  //           className={styles.card}
  //         >
  //           <h2>Examples &rarr;</h2>
  //           <p>Discover and deploy boilerplate example Next.js projects.</p>
  //         </a>

  //         <a
  //           href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
  //           className={styles.card}
  //         >
  //           <h2>Deploy &rarr;</h2>
  //           <p>
  //             Instantly deploy your Next.js site to a public URL with Vercel.
  //           </p>
  //         </a>
  //       </div>
  //     </main>

  //     <footer className={styles.footer}>
  //       <a
  //         href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Powered by{' '}
  //         <span className={styles.logo}>
  //           <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
  //         </span>
  //       </a>
  //     </footer>
  //   </div>
  // )
  const[loading,setLoading] = useState(false)
  const[alreadyAMember ,setAlredyAMember] = useState(false)
  const account = useContext(OwnersAccount)
  const[price, setPrice] =useState(0)
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const[name,setName] =useState("")
  const[serial, setSerial]= useState(1)

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
     
     
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
     
      await getProviderOrSigner();
     checIfAlreadyAMember()
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


  const joinmembership = async () => {
    try {
     
        const signer = await getProviderOrSigner(true);
       
        const token= new Contract(LinkTokenAddress, LINK.abi,signer)

       let amount = await token.getPrice();
      
        amount = amount.toString();

        let tx = await token.joinMembership(name,{
          value : amount
        });
       setLoading(true)
        await tx.wait();
        setLoading(false)
        setAlredyAMember(true);
    } catch (error) {
      console.log(error);
    }
  
  }
  const checIfAlreadyAMember = async () => {
    const signer = await getProviderOrSigner(true);
   
    const token= new Contract(LinkTokenAddress, LINK.abi,signer)
   
    const tx = await token.IsAMember(signer.getAddress());

    if (tx) {
      setAlredyAMember(true);
    }
    else {
      setAlredyAMember(false);
    }


  }


  const renderButton = () =>{
    if(account !== OwnersAddress) {
      if(!alreadyAMember) {
        return (
          <div className='p-3' style={{fontSize:"29px", fontWeight:"700"}}>
            
              Welcome to OleanjiDAO ChainLink DAO
              <div className='p-1' style={{fontSize:"20px", fontWeight:"500"}}>
              DAO&apos;s CA: 
                {
                  (
                    <span style={{paddingLeft:"10px"}}>
                      {
                         LinkTokenAddress
                      }
                    </span>
                  )
                  
                }
                <br/> <br/>
                <div style={{fontSize:"16px", fontWeight:"400"}}> 
                   To be a member you have to Register: 
                 </div>
                 <br/> 
              </div>
              <div className='d-flex text-align-center' style={{fontSize:"15px"}}> 
              <span className='my-1 mx-2'>
              Name:
              </span>
              
              
            
            <input
              placeholder='Enter Any Name'
              type="text"
              onChange={e => setName(e.target.value)}
              style={{padding:"10px", border:"1px solid black" , borderRadius:"10px",width:"100%", fontSize:"10px"}}
              />
              </div> {
                loading ? 
                (
                  <button style={{border:"none", textAlign:"center", 
                  padding:"10px 20px",color:"white",  fontSize:"10px", 
                  backgroundColor:"blue",marginTop:"20px", float:"right" , borderRadius:"10px"}}>
                  ...Loading...
                  </button>
                ) : (
                  <button onClick={joinmembership}  style={{border:"none", textAlign:"center", 
                  padding:"10px 20px",color:"white",  fontSize:"10px", 
                  backgroundColor:"blue",marginTop:"20px", float:"right" , borderRadius:"10px"}}>
                    Join Membership
                  </button>
                  ) 
              }
            
          </div>
        )
        
      }
      else if(alreadyAMember){
        return (
          <div className='p-3' style={{fontSize:"29px", fontWeight:"700"}}>
            
              Welcome Back to OleanjiDAO ChainLink DAO You are now a Member 🎉🎉🎉
              <br/><br/>
              <div className='p-1' style={{fontSize:"20px", fontWeight:"500"}}>
              DAO&apos;s CA: 
                {
                  (
                    <span style={{paddingLeft:"10px"}}>
                      {
                         LinkTokenAddress
                      }
                    </span>
                  )
                  
                }
                <br/> <br/><br/>
                 <div style={{fontSize:"16px", fontWeight:"400"}}> 
                   As a member you can now explore this DAO 
                 </div>
              </div>
           
           
          </div>
        )
      }
    }
    else if (account === OwnersAddress) {
      return (
        <div className='p-3' style={{fontSize:"29px", fontWeight:"700"}}>
        Welcome Admin 
          <div>
          DAO&apos;s CA: 
                {
                  (
                    <span style={{paddingLeft:"10px"}}>
                      {
                         LinkTokenAddress
                      }
                    </span>
                  )
                  
                }
            <br/> <br/><br/>
            <div style={{fontSize:"16px", fontWeight:"400"}}> 
                   Check the members in the All-Members tab
                 </div>
              
          </div>
      </div>
      )
    }
    
    
    
  }
  return (

    <div>
     {renderButton()}
    </div>
  )


}
