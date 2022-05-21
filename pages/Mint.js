import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress,NFTAddress} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"

import LINK from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json'
import OCH from '../artifacts/contracts/OCH.sol/OCH.json'


export default function Mint() {
    const[alredyAMemberOfDAO , setAlredyAMemberOfDAO] = useState(false)
    const [walletConnected, setWalletConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    const web3ModalRef = useRef();
    const router = useRouter()
    const [alreadyMinted, setAlredyMinted] =useState(false)



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
          setWalletConnected(true);
          await checIfAlreadyAMemberOfDAO();
          await checIfAlreadyMinted();
        } catch (err) {
          console.error(err);
        }
    };
    

    useEffect(() => {
  
    if (!walletConnected) {
        
        web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
        });
        connectWallet();
       setInterval(async function () {
            await HowManyMinted(); 
        }, 5* 1000);
    }
    }, [walletConnected]);
    


    const checIfAlreadyAMemberOfDAO = async() =>{
        try {
        const signer = await getProviderOrSigner(true);
           
        const contract = new Contract(LinkTokenAddress,LINK.abi,signer);
        
        const tx = await contract.IsAMember(signer.getAddress());
        if (tx) {
        setAlredyAMemberOfDAO(true);
        }
        else {
        setAlredyAMemberOfDAO(false);
        }
        } catch (error) {
            console.log(error)
        }
        
       
    }



    const Mint = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const NFTContract = new Contract(NFTAddress,OCH.abi,signer);
            const Tokencontract = new Contract(LinkTokenAddress,LINK.abi,signer);
            const transact = await NFTContract.getMintingPrice()
            const utils = transact.toString();
            const amount =  ethers.utils.parseEther(utils)
            const happy = await Tokencontract.approve(NFTAddress, amount.toString());
            setLoading(true)
            await happy.wait()
            const mint = await NFTContract.Mint(amount)
           
            await mint.wait()
            setLoading(false)
            window.alert("You have minted an OCH NFT Right Now Congratulations 🎉🎉🎉 ")
            checIfAlreadyMinted()
        } catch (q) {
            console.log(q)
        }
    }
    const HowManyMinted= async () => {
        try {
          const provider = await getProviderOrSigner();
          const NFTContract = new Contract(NFTAddress,OCH.abi,provider);
          const _tokenIds = await NFTContract.tokenIds();
          setTokenIdsMinted(_tokenIds.toString());
        } catch (err) {
          console.error(err);
        }
      };

    
    const goback =  () =>{
       
        router.push('/')
           
    }

    const checIfAlreadyMinted= async() =>{
        try {
         
        const signer = await getProviderOrSigner(true);

        const NFTContract = new Contract(NFTAddress,OCH.abi,signer);
        
      
        const tx = await NFTContract.AlreadyMintedAnNFT(signer.getAddress());
        console.log(tx)
        if (tx) {
        setAlredyMinted(true);
        }
        else {
        setAlredyMinted(false);
        }
        } catch (error) {
            console.log(error)
            
        }
        
       
    }

    const renderButton = () => {
        if(!walletConnected) {
            return (
              <button onClick={connectWallet} style={{border:"none", textAlign:"center", 
              padding:"10px 20px",color:"white",  fontSize:"16px", 
              backgroundColor:"blue",marginTop:"20px", borderRadius:"10px"}}>
                Connect Wallet
              </button>
            )
        }
        if(!alredyAMemberOfDAO ){
              
            return(
                <div className='d-inline-block'>
                    <div className='p-1' style={{fontSize:"20px", fontWeight:"500"}}>
                        This Page is unavailable to you because you are not a member.
                        To register Go to home page 😥
                    </div>
                    <button onClick={goback} style={{border:"none", textAlign:"center", 
                        padding:"10px 20px",color:"white",  fontSize:"16px", 
                        backgroundColor:"blue",marginTop:"20px" , borderRadius:"10px"}}>
                        Go Home
                    </button>
                </div>
            )
                
        }

        if(alredyAMemberOfDAO && tokenIdsMinted <= 12 ) {
            return(
               
                <div className='row d-flex justify-content-center align-items-center' style={{flexDirection:"column",marginLeft:"-240px", marginTop:"100px"}}>
                   
                        <img src="/image.png" style={{width:"864px", height:"864px"}} className={styles.boxyImage}/>
                   
                    <div className='col-md-8 ' style={{zIndex:"999"}}>
                        <div style={{width:"450px", height:"300px", backgroundColor:"blanchedalmond", padding:"30px 30px",boxShadow:" 0px 5px 20px 0px rgba(0, 81, 250, 0.1)", borderRadius:"25px"}}>
                            <div style={{fontSize:"20px",fontWeight:"500", paddingBottom:"40px"}}>
                                Each Member can only mint 1 OCH NFT Once for 200 OLT.
                            </div>
                            <div style={{fontSize:"14px",fontWeight:"400", paddingBottom:"20px"}}>
                                Amount of NFT Minted : {tokenIdsMinted} out of  12
                            </div>
                            <div>
                                {
                                    alreadyMinted ? (
                                        <div>
                                            <div style={{fontSize:"14px",fontWeight:"400", paddingBottom:"20px"}}>
                                               You have already Minted Go to Opensea, LogIn and go to Collections to view ur OCH NFT
                                            </div>
                                            <button style={{border:"none", textAlign:"center", 
                                                    padding:"10px 20px",color:"white",  fontSize:"16px", 
                                                    backgroundColor:"white",marginTop:"10px", borderRadius:"10px"}}>
                                                        <a target="_blank" href="https://testnets.opensea.io/" rel="noreferrer">
                                                           OpenSea Rinkeby
                                                        </a>
                                            </button>
                                        </div>
                                    ):
                                    (
                                        <div>
                                            {

                                                loading ?
                                                (
                                                    <button style={{border:"none", textAlign:"center", 
                                                    padding:"10px 20px",color:"white",  fontSize:"16px", 
                                                    backgroundColor:"blue",marginTop:"20px", borderRadius:"10px"}}>
                                                        ...Loading...
                                                    </button>
                                                ) :
                                                (
                                                    <button onClick={Mint} style={{border:"none", textAlign:"center", 
                                                        padding:"10px 20px",color:"white",  fontSize:"16px", 
                                                        backgroundColor:"blue",marginTop:"20px" , borderRadius:"10px"}}>
                                                            MINT
                                                    </button>
                                                )
                                            }
                                        </div>
                                    )
                                }
                                
                            </div>
                        </div>
                    </div>
                </div>
               
            )
        }
        if(alredyAMemberOfDAO && tokenIdsMinted > 12 ) { 
            return(
               
                <div className='row d-flex justify-content-center align-items-center' style={{flexDirection:"column",marginLeft:"-240px", marginTop:"100px"}}>
                   
                <img src="/image.png" style={{width:"864px", height:"864px"}} className={styles.boxyImage}/>
           
            <div className='col-md-8 ' style={{zIndex:"999"}}>
                <div style={{width:"450px", height:"300px", backgroundColor:"blanchedalmond", padding:"30px 30px",boxShadow:" 0px 5px 20px 0px rgba(0, 81, 250, 0.1)", borderRadius:"25px"}}>
                    <div style={{fontSize:"21px",fontWeight:"600", paddingBottom:"40px"}}>
                        Each Member can only mint 1 OCH NFT Once.
                    </div>
                    <div style={{fontSize:"16px",fontWeight:"500", paddingBottom:"30px"}}>
                        Amount of NFT Minted : {tokenIdsMinted} out of  12
                                The NFT&apos;s has all been minted sorry bro. 😥
                            </div>
                            <div>
                                <button style={{border:"none", textAlign:"center", 
                                    padding:"10px 20px",color:"white",  fontSize:"16px",  
                                    backgroundColor:"blue", marginTop:"20px", borderRadius:"10px"}}>
                                        SORRY A DUMMY MINT BUTTON TO HELP YOU HOPE. 😥
                                </button>
                                
                            </div>
                        </div>
                    </div>
                </div>
               
            )
        }


    }



    return(

        <div >
        {renderButton()}
        
        </div>
    )
}