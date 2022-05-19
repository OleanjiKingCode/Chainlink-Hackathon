import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress,VotingAddress} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"

import LINK from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json'
import VOTE from '../artifacts/contracts/voting.sol/VotingDappByOleanji.json'



export default function VotingPoll() {
    const[loading,setLoading]= useState(false)
    const[alreadyACandidate ,setAlredyACandidate] = useState(false)
    const[alredyAMemberOfDAO , setAlredyAMemberOfDAO] = useState(false)
    const account = useContext(OwnersAccount)
    // const[name,setName] =useState("")
    const[slogan, setSlogan] = useState("")
    const[address,setAddress] =useState("")
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const[members,setMembers] =useState([])
    const router = useRouter()
    const[rand,setRand]= useState(0)
    const[Winner,setWinner]= useState("")
    const[status,setStatus]=useState(true)
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
          setWalletConnected(true);

         await checIfAlreadyAMemberOfDAO()
         await checIfAlreadyACandidate()
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
        console.log("sdcjnsdhj");
        fetchVotersList();

        const EndedInterval2 = setInterval(async function () {
                await CheckIfSetRandNum(); 
                if(rand > 0) {
                    clearInterval(EndedInterval2);
                }
            },
             5* 1000);

             const EndedInterval = setInterval(async function () {
                await GetTheAddressOfWinner(); 
                await checkSateOfProcess();
                
            },
             5* 1000);
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
        // let name = await Tokencontract.getInfo();
        console.log("slogan")
        setAlredyACandidate(true);
        // setName(name);
        
        
    } catch (error) {
        console.log(error)
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
                slogan :i.Slogan,
                name:i.name
            }
            
            return List
        }))
        // const Tokencontract = new Contract(LinkTokenAddress,LINK.abi,signer);
        // const _name = await Tokencontract.getInfo();
        // setName(_name);
      
        setMembers(list);
       
        } catch (m) {
            console.log(m)
        }
        

    }
    const CheckIfSetRandNum = async () => {
        try {
            const provider = await getProviderOrSigner();
            const contract = new Contract(VotingAddress,VOTE.abi,provider);
            const get  = await contract.s_randomLuck();
            const rand = get.toNumber();
            if(rand == 0){
                return false;
            }
           else{
              
               setRand(rand);
               return true;
           }
        } catch (error) {
            console.log(error);
            return false;
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
    const GetTheAddressOfWinner = async () => {
        const provider = await getProviderOrSigner();
        const contract = new Contract(VotingAddress,VOTE.abi,provider);
        const winnerAddress  = await contract.winner();
        setWinner(winnerAddress);
    }

    const checkSateOfProcess = async () =>{
        try {
            const provider = await getProviderOrSigner();
            const contract = new Contract(VotingAddress,VOTE.abi,provider);
            const Open  = await contract.applicationStarted();
            const calc  = await contract.applicationCalculating();
            if(Open && !calc){
                setStatus(true);
            }
            else if(!open && calc){
                setStatus(false); 
            }

            
        } catch (error) {
            console.log(error);
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
        if(alredyAMemberOfDAO && !alreadyACandidate && status){
            return(
                <div style={{marginTop:"-200px"}}>
                    <div style={{fontSize:"25px", fontWeight:"600"}}>
                            THIS IS THE LOTTERY SYSTEM AND IT OCCURS EVERY 15 MINUTES SO RELAOD IF IT HASNT STATRED YET.
                            NOTE: IF YOU ARE SIGNING UP FOR THIS ITS COST 250 OLT 🤑 💰💰
                            
                       
                    </div>
                    <br/> <br/>
                    <div style={{fontSize:"16px", fontWeight:"400"}}> 
                    ENTER YOUR SLOGAN TO BE CHOSEN IF WORTHY!!!!!!!
                    </div>
                    
                    <div>
                        <input
                        placeholder='slogan'
                        type="text"
                        onChange={e => setSlogan(e.target.value)}   style={{padding:"10px", border:"1px solid black" , borderRadius:"10px",width:"100%", fontSize:"14px"}}/>
                            {
                                loading ?
                                (
                                    <button style={{border:"none", textAlign:"center", 
                                    padding:"10px 20px",color:"white",  fontSize:"14px", 
                                    backgroundColor:"blue",marginTop:"20px", float:"right" , borderRadius:"10px"}}>
                                        ...Loading...
                                    </button>
                                ) :
                                (
                                    <button onClick={jointhecandidateList} style={{border:"none", textAlign:"center", 
                                        padding:"10px 20px",color:"white",  fontSize:"14px", 
                                        backgroundColor:"blue",marginTop:"20px", float:"right" , borderRadius:"10px"}}>
                                            Apply
                                    </button>
                                )
                            }
                        
                        
                    </div>
                    <br/>  <br/> 
                    The Last Winner was : {
                        (
                            <span style={{padding:"10px",backgroundColor:"white", width:"380px", borderRadius:"10px"}}>
                            {
                                Winner
                            }
                            </span>
                        )
                
                    }
                    <br/>  <br/>  <br/>  <br/>
                    <div> 
           
                        <table className={styles.table}>
                            <tbody>

                            
                            <tr className={styles.tr}>
                            <th className={styles.th}>
                                No
                            </th>
                            <th className={styles.th}>
                                ID
                            </th>
                            <th className={styles.th}>
                                Slogan
                            </th>
                            
                            <th className={styles.th}>
                               Name
                            </th>
                            <th className={styles.th}>
                                Address
                            </th>
                            </tr>


                    {
    
                        members.map((lists,i) => {
    
                            return(
                                !lists.Id == 0 && 
                                <tr key={i} className={styles.tr} style={{fontSize:"10px"}}>
                                    <td className={styles.td}>
                                    {serial++}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.Id}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.slogan}
                                    </td>
                
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.name}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.Address}
                                    </td>
                                </tr>
                            
                            )
                        })
                    }

                </tbody>
            </table>
        </div>
        </div>
            )
        }
        // else (alreadyACandidate && !status){
            if(alredyAMemberOfDAO && alreadyACandidate && status){
            return (
                <div style={{marginTop:"-200px"}}>
                    <div style={{fontSize:"25px", fontWeight:"600"}}>
                        You can&apos;t enter again as the results is been collated 🥺🥺
                    </div>
                    <br/>  <br/>
                    The Last Winner was : {
                        (
                            <span style={{padding:"10px",backgroundColor:"white", width:"380px", borderRadius:"10px"}}>
                            {
                                Winner
                            }
                            </span>
                        )
                
                    }
                    <br/>  <br/>
                    <div> 
           
                        <table className={styles.table}>
                            <tbody>

                            
                            <tr className={styles.tr}>
                            <th className={styles.th}>
                                No
                            </th>
                            <th className={styles.th}>
                                ID
                            </th>
                            <th className={styles.th}>
                                Slogan
                            </th>
                            
                            <th className={styles.th}>
                               Name
                            </th>
                            <th className={styles.th}>
                                Address
                            </th>
                            </tr>


                    {
    
                        members.map((lists,i) => {
    
                            return(
                                !lists.Id == 0 && 
                                <tr key={i} className={styles.tr} style={{fontSize:"10px"}}>
                                    <td className={styles.td}>
                                    {serial++}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.Id}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.slogan}
                                    </td>
                
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.name}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.Address}
                                    </td>
                                </tr>
                            
                            )
                        })
                    }

                </tbody>
            </table>
        </div>
                </div>
            )
        }
        if (alredyAMemberOfDAO && !alreadyACandidate && !status){
            return (
                <div style={{marginTop:"-200px"}}>
                    <div style={{fontSize:"25px", fontWeight:"600"}}>
                    You can&apos;t enter again as the results is been collated and you missed it. 😜😜
                    </div>
                    <br/>  <br/>
                    

                    <div style={{fontSize:"16px", fontWeight:"400"}}> 
                    The people who didn&apos;t miss it are:
                    </div>
                        <div> 
           
                        <table className={styles.table}>
                            <tbody>

                            
                            <tr className={styles.tr}>
                            <th className={styles.th}>
                                No
                            </th>
                            <th className={styles.th}>
                                ID
                            </th>
                            <th className={styles.th}>
                                Slogan
                            </th>
                            
                            <th className={styles.th}>
                               Name
                            </th>
                            <th className={styles.th}>
                                Address
                            </th>
                            </tr>


                    {
    
                        members.map((lists,i) => {
    
                            return(
                                !lists.Id == 0 && 
                                <tr key={i} className={styles.tr} style={{fontSize:"10px"}}>
                                    <td className={styles.td}>
                                    {serial++}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.Id}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.slogan}
                                    </td>
                
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.name}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"10px"}}>
                                        {lists.Address}
                                    </td>
                                </tr>
                            
                            )
                        })
                    }

                </tbody>
            </table>
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