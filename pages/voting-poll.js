import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import Link from 'next/link';
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress ,  abi} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"



export default function VotingPoll() {
    const[alreadyACandidate ,setAlredyACandidate] = useState(false)
    const account = useContext(OwnersAccount)
    const[slogan, setSlogan] = useState("")
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const[members,setMembers] =useState([])
    const[name,setName] =useState("")
    const[address,setAddress] =useState("")
  
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
          await fetchVotersList()
         
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





    const jointhecandidateList = async () =>{
    try {
        const signer = await getProviderOrSigner(true);
        let address = signer.getAddress();
        setAddress(address);
        const contract = new Contract(LinkTokenAddress,abi,signer);
        let transact = await contract.getVotingPrice()
            transact = await contract.approve(LinkTokenAddress, transact.toString());
            console.log(slogan)
            transact = await contract.jointhecandidateList(slogan);
            console.log("jnn")
        await transact.wait()
        console.log("jnn")
        setName(transact);
        setAlredyACandidate(true);
        await fetchVotersList()
    } catch (error) {
        console.log(error)
    }
    
    }



    const fetchVotersList = async () =>{
        try {
            const signer = await getProviderOrSigner(true);

        const contract = new Contract(LinkTokenAddress,abi,signer);
        const transact = await contract.fetchVotersList();
        const list = await Promise.all(transact.map(async i => {

            let List = {
                Id : i.votersId.toNumber(),
                slogan :i.Slogan

            }
            
            return List
        }))
        setMembers(list);
        console.log(members)
        } catch (m) {
            console.log(m)
        }
        

    }
    // const checIfAlreadyACandidate = async() =>{
    //     const signer = await getProviderOrSigner(true);

    //     const contract = new Contract(LinkTokenAddress,abi,signer);
    //     const tx = await contract.fetchVotersList();


    //     if (tx) {
    //         setAlredyAMember(true);
    //       }
    //       else {
    //         setAlredyAMember(false);
    //       }
      
    // }
    const renderButton = () =>
    {
        if(alreadyACandidate) { 
            
            {
                
                members.map((lists,i) => {
        
                    return(
                        <div key={i}>
                            <p>
                               {lists.Id}
                            </p>
                            <p>
                                {lists.slogan}
                            </p>
        
                            <p>
                                {name}
                            </p>
                            <p>
                                {address}
                            </p>
                        </div>
                    )
                })
            }
        }else {
            return(
                <div>

                </div>
            )
        }
    }

    return (

        <div>
            <Head>

            </Head>
            <div>
                <div>
                    <p> 
                        NOTE: YOU ARE SIGNING UP FOR THIS FOR 150OLT ENTER YOUR SLOGAN TO BE CHOSEN IF WORTHY!!!!!!!
                    </p>
                </div>
                <div>
                    <input
                    placeholder='slogan'
                    type="text"
                    onChange={e => setSlogan(e.target.value)} />
                    <button
                   onClick={jointhecandidateList}
                    >
                       <p>Apply</p> 
                    </button>
                </div>
            {renderButton()}
            </div>
        </div>
    )
}