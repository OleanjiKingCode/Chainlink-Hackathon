import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import Link from 'next/link';
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress , abiToken , abiVoting,VotingAddress} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"



export default function VotingPoll() {
    const[alreadyACandidate ,setAlredyACandidate] = useState(false)
    const[alredyAMemberOfDAO , setAlredyAMemberOfDAO] = useState(false)
    const account = useContext(OwnersAccount)
    const[name,setName] =useState("")
    const[slogan, setSlogan] = useState("")
    const[address,setAddress] =useState("")
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const[members,setMembers] =useState([])
    const router = useRouter()
    
    
  
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
          await checIfAlreadyAMemberOfDAO()
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

        const Tokencontract = new Contract(LinkTokenAddress,abiToken,signer);
        const votingcontract = new Contract(VotingAddress,abiVoting,signer);
        const transact = await votingcontract.getVotingPrice()
        const   amount =  ethers.utils.parseEther(transact.toString())
        const approval = await Tokencontract.approve(VotingAddress, amount.toString());
            console.log(slogan)
        const join = await votingcontract.jointhecandidateList(slogan,amount);
            console.log(slogan)
        await join.wait()

        setAlredyACandidate(true);
        console.log("slogan")
        let name = await Tokencontract.getInfo();
        console.log("slogan")
        setName(name);
        setAlredyACandidate(true);
        fetchVotersList()
    } catch (error) {
        console.log(error)
    }
    
    }



    const fetchVotersList = async () =>{
        try {
            
        const signer = await getProviderOrSigner(true);

        const contract = new Contract(VotingAddress,abiVoting,signer);
        const transact = await contract.fetchVotersList();
        const list = await Promise.all(transact.map(async i => {

            let List = {
                Id : i.votersId.toNumber(),
                Name:i.Name,
                Address:i.candidateAddress,
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

    const checIfAlreadyAMemberOfDAO = async() =>{
        try {
            const signer = await getProviderOrSigner(true);
           
        const contract = new Contract(LinkTokenAddress,abiToken,signer);
        
        const tx = await contract.IsAMember(signer.getAddress());
        // console.log("tx")
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
    const goback =  () =>{
       
        router.push('/')
           
    }
    const renderButton = () =>
    {
        if(alredyAMemberOfDAO){
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
                                    {lists.Name}
                                </p>
                                <p>
                                    {lists.Address}
                                </p>
                            </div>
                        )
                    })
                }
            }else if (!alreadyACandidate)
            {
            return(
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
        
        
                </div>
            )
            }
        }
        else if (account == OwnersAddress) {
            fetchVotersList
        }
        else if (!alredyAMemberOfDAO) {
            return(
                <div>
                <p>
                    Go to home to join Membership to be able to view this section.
                </p>
                <button onClick={goback}
                >
                    HOME
                </button>
                </div>
            )
        }
      
       
    }

    return (

        <div>
            <Head>

            </Head>
            <div>
                
            {renderButton()}
            </div>
        </div>
    )
}