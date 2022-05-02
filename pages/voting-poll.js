import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress,VotingAddress ,VRFAddress} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"

import LINK from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json'
import VOTE from '../artifacts/contracts/voting.sol/VotingDappByOleanji.json'
import VRF from '../artifacts/contracts/LinkVRF.sol/VRFv2Consumer.json'

export default function VotingPoll() {
    const[loading,setLoading]= useState(false)
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
    const [started,setStarted] = useState(false)
    const[ended,setEnded]=useState(false)
    const[rand,setRand]= useState(0)
    const[finished, setFinished] = useState(false)



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

         await checIfAlreadyAMemberOfDAO()
         await checIfAlreadyACandidate()
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

       
        const __started = checkifStarted();
    
        if(__started){
           fetchVotersList()
            checkifEnded();
        }

       
        const EndedInterval = setInterval(async function () {
            const _Started = await checkifStarted();
            if (_Started) {
              const _Ended = await checkifEnded();
              if (_Ended) {
                  console.log(_Ended + "dwef    wefwefwef")
                  
                  await fetchVotersList()
                clearInterval(EndedInterval);
              }
            }
          }, 5 * 1000);
        }
    }, [walletConnected]);





    const jointhecandidateList = async () =>{
    try {
        const signer = await getProviderOrSigner(true);
        let address = signer.getAddress();
        setAddress(address);
        const Tokencontract = new Contract(LinkTokenAddress,LINK.abi,signer);
        const votingcontract = new Contract(VotingAddress,VOTE.abi,signer);
        const transact = await votingcontract.getVotingPrice()
        const utils = transact.toString();
        const amount =  ethers.utils.parseEther(utils)
        const happy = await Tokencontract.approve(VotingAddress, amount.toString());
            console.log(slogan)
            console.log(amount)
            setLoading(true)
            await happy.wait()
        const join = await votingcontract.jointhecandidateList(slogan,amount);
            console.log(slogan)
        await join.wait()
        setLoading(false)
        await fetchVotersList();
        console.log("slogan")
        let name = await Tokencontract.getInfo();
        console.log("slogan")
        setAlredyACandidate(true);
        setName(name);
        
        
    } catch (error) {
        console.log(error)
    }
    
    }

    const startApplication = async () =>{
        try {
            const signer = await getProviderOrSigner(true);
            const contract = new Contract(VotingAddress,VOTE.abi,signer);
            const start = await contract.startApplication()
            setLoading(true)
            await start.wait()
            setLoading(false)
           await checkifStarted();
        } catch (e) {
            console.log(e)
        }
       
    }

    const checkifStarted = async ()=>{
        try {
         
            const provider = await getProviderOrSigner();
           
            const votingContract = new Contract(VotingAddress,VOTE.abi,provider);
           
            const hasStarted = await votingContract.applicationStarted();
            setStarted(hasStarted)
            console.log(hasStarted)
            return hasStarted;
           
        } catch (error) {
            console.log(error)
            return false
        }
    }
    const checkifEnded = async ()=>{
        try {
            const provider = await getProviderOrSigner();
            const contract = new Contract(VotingAddress,VOTE.abi,provider);
            const ended = await contract.applicationEnded();

            const hasended = ended.lt(Math.floor(Date.now() / 1000));

            if(hasended){
                setEnded(true)
                
            }else {
                setEnded(false)
            }
            
            return hasended;
        } catch (error) {
            console.log(error)
            return false
        }
    }
    const fetchVotersList = async () =>{
        try {
            
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(VotingAddress,VOTE.abi,signer);
        const transact = await contract.fetchVotersList();
        
        const list = await Promise.all(transact.map(async i => {

            let List = {
                Id : i.votersId.toNumber(),
                
                Address:i.candidateAddress,
                slogan :i.Slogan

            }
            
            return List
        }))
        const Tokencontract = new Contract(LinkTokenAddress,LINK.abi,signer);
        const _name = await Tokencontract.getInfo();
        setName(_name);
      
        setMembers(list);
        console.log(members)
        } catch (m) {
            console.log(m)
        }
        

    }
    const GetRandomNumber = async () =>{
        try {
            const signer = await getProviderOrSigner(true);
            const vrfContract = new Contract(VRFAddress,VRF.abi,signer);
            const request =  await vrfContract.requestRandomWords();
           
            await request.wait()
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(10000);
            const id = await vrfContract.s_requestId();
           console.log(id)
            await delay(60000);
            console.log("jnn")
            const RandomNum = await vrfContract.s_randomWords()
            setRand(RandomNum);
            console.log(rand)
            setFinished(true)
        } catch (m) {
            console.log(m)
        }
    }
    const checIfAlreadyACandidate = async() =>{
        try {
            const signer = await getProviderOrSigner(true);
           
            const contract = new Contract(VotingAddress,VOTE.abi,signer);
        
        const tx = await contract.IsACandidate(signer.getAddress());
        if (tx) {
        setAlredyACandidate(true);
        }
        else {
        setAlredyACandidate(false);
        }
        } catch (error) {
            console.log(error)
        }
        
       
    }

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
    const goback =  () =>{
       
        router.push('/')
           
    }
    const renderButton = () =>
    {
       
        if (!walletConnected) {
            return (
              <button onClick={connectWallet} className={styles.button}>
                Connect your wallet
              </button>
            );
          }
          if(loading){
              return (
                  <div>
                      <button>
                            ...Loading...
                        </button>
                  </div>
              )
          }
        if(account == OwnersAddress && !started ) {
                

                return (
                    <button onClick={startApplication}>
                        START APPLICATION
                    </button>
                )
        }
        if(alredyAMemberOfDAO && !started){
            return (
                <h3>
                    Application Process Has Not Started.
                </h3>
            )
        }
         if (!alredyAMemberOfDAO && !started) {
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
        
        if( started && !ended ) {

            if (account == OwnersAddress) {
                return (
                    <div>
                        <h3>
                            LIST OF CANDIDATES
                        </h3>
                        {
                            members.map((lists,i) => {
                               
    
                                return(
                                    !lists.Id == 0 && 
                                    <div>
                                        
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
                                            {lists.Address}
                                        </p>
                                    </div>
                                    </div>
                                )
                                })
                        }
                    </div>
                )
                

            }
            else if(!(account == OwnersAddress) && !alredyAMemberOfDAO){
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
            else if(alredyAMemberOfDAO && !alreadyACandidate){
                return(
                    <div>
                        <div>
                            <p> 
                                NOTE: YOU ARE SIGNING UP FOR THIS FOR 150 OLT ENTER YOUR SLOGAN TO BE CHOSEN IF WORTHY!!!!!!!
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
            else  {
                return (
                    <div>
                         <h3>
                            LIST OF CANDIDATES
                        </h3>
                        {
                            members.map((lists,i) => {
    
                                return(
                                    !lists.Id == 0 && 
                                    <div>
                                       
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
                                            {lists.Address}
                                        </p>
                                    </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        }
        if(started && ended) { 
            if(!(account == OwnersAddress) && !alredyAMemberOfDAO){
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
          
           else if(alredyAMemberOfDAO && alreadyACandidate)     
            {
            return (
                <div>
                     <h3>PLS WAIT FOR RESULTS </h3>
                    {
                        
                        members.map((lists,i) => {
    
                            return(
                                !lists.Id == 0 && 
                                <div>
                                   
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
                                        {lists.Address}
                                    </p>
                                </div>
                                </div>
                            )
                        })
                    }
                </div>
            )
            
            }
            else {
                return (
                    <div>
                        <button onClick={GetRandomNumber}>
                            Get random person
                        </button>
                        {
                                    
                            members.map((lists,i) => {
                    
                                return(
                                    
                                    !lists.Id == 0 && 
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
                                            {lists.Address}
                                        </p>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        }
        if(finished) { 
            if(!(account == OwnersAddress) && !alredyAMemberOfDAO){
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
          
           else if(alredyAMemberOfDAO && alreadyACandidate)     
            {
            return (
                <div>
                     <h3> The winner is {rand} </h3>
                    {
                        
                        members.map((lists,i) => {
    
                            return(
                                !lists.Id == 0 && 
                                <div>
                                   
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
                                        {lists.Address}
                                    </p>
                                </div>
                                </div>
                            )
                        })
                    }
                </div>
            )
            
            }
            else {
                return (
                    <div>
                          <h3> The winner is {rand} </h3>
                        {
                                    
                            members.map((lists,i) => {
                    
                                return(
                                    
                                    !lists.Id == 0 && 
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
                                            {lists.Address}
                                        </p>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        }
    }

    return (

        <div>
            <div>  
            {renderButton()}
            </div>
        </div>
    )
}