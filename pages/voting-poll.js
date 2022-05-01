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
    const [started,setStarted] = useState(false)
    const[ended,setEnded]=useState(false)
    
  
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
          setWalletConnected(true);
         await checIfAlreadyAMemberOfDAO()
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

    const startApplication = async () =>{
        try {
            const signer = await getProviderOrSigner(true);
            const contract = new Contract(VotingAddress,abiVoting,signer);
            const start = await contract.startApplication()

            await start.wait()

           await checkifStarted();
        } catch (e) {
            console.log(e)
        }
       
    }

    const checkifStarted = async ()=>{
        try {
         
            const provider = await getProviderOrSigner();
           
            const votingContract = new Contract(VotingAddress,abiVoting,provider);
           
            const hasStarted = await votingContract.applicationStarted();
        
            // if(hasStarted){
            //     console.log("im here")
            //     setStarted(true)
            // }else {
            //     setStarted(false)
            // }
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
            const contract = new Contract(VotingAddress,abiVoting,provider);
            const ended = await contract.applicationEnded();

            const hasended = ended.lt(Math.floor(Date.now() / 1000));

            if(hasended){
                setEnded(true)
                console.log("has ended ooooooooooooooooooooooooo")
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

        const contract = new Contract(VotingAddress,abiVoting,signer);
        const transact = await contract.fetchVotersList();
        const Tokencontract = new Contract(LinkTokenAddress,abiToken,signer);
        const _name = await Tokencontract.getInfo();
        const list = await Promise.all(transact.map(async i => {

            let List = {
                Id : i.votersId.toNumber(),
                
                Address:i.candidateAddress,
                slogan :i.Slogan

            }
            
            return List
        }))

        setName(_name);
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
       
        if (!walletConnected) {
            return (
              <button onClick={connectWallet} className={styles.button}>
                Connect your wallet
              </button>
            );
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
        
        if(started && !ended && account == OwnersAddress) { 
            {
                            
                    members.map((lists,i) => {
            
                        return(
                            <div>
                                <h3>PEOPLE WHO HAVE JOINED</h3>
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

        }
        if( started && !ended && alredyAMemberOfDAO && !alreadyACandidate ){
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
        if( started && !ended && !alredyAMemberOfDAO  ){
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
        if( started && !ended && alredyAMemberOfDAO && alreadyACandidate ){
                        
            members.map((lists,i) => {
    
                return(
                    <div>
                        <h3>
                            LIST OF CANDIDATES
                        </h3>
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
        if((started && ended &&  account == OwnersAddress) || (started && ended && alredyAMemberOfDAO && !alreadyACandidate) ){
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
                                {lists.Address}
                            </p>
                        </div>
                    )
                })
            }
        }
        
        if(started && ended && alredyAMemberOfDAO && alreadyACandidate)     
        {
            
            members.map((lists,i) => {
    
                return(
                    <div>
                        <h3>PLS WAIT FOR RESULTS </h3>
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
        
        if (started && ended && !alredyAMemberOfDAO) {
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
           {/* {members} */}
            <div>
                
            {renderButton()}
            </div>
        </div>
    )
}