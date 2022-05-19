import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress,ChattingAddress} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"

import LINK from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json'
import VOTE from '../artifacts/contracts/voting.sol/VotingDappByOleanji.json'
import CHAT from '../artifacts/contracts/chatting.sol/chatting.json'

export default function Chatting () {

    const [walletConnected, setWalletConnected] = useState(false);
    const [loading ,setLoading] = useState(false)
    const [message ,setMessage] = useState("")
    const[hash, setHash]= useState("")
    const[serial, setSerial]= useState(1)
    const[allTransactions, setAllTransactions] = useState([])
    const [time , setTime] = useState("")
    const[price,setPrice] = useState(0)
    const [owner , setOwner] = useState("")
    const[alredyAMemberOfDAO , setAlredyAMemberOfDAO] = useState(false)
    const router = useRouter()
    const[name,setName]= useState("")
    const web3ModalRef = useRef();

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

  
    const getProviderOrSigner = async (needSigner = false) => {
     
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
  
      // If user is not connected to the Ropsten network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      console.log(chainId)
      if (chainId !== 4) {
        window.alert("Change the network to Rinkeby");
        throw new Error("Change network to Rinkeby");
      }
  
      if (needSigner) {
        const signer = web3Provider.getSigner();
        // this is done here to set the owner address and this would show transactions done before on loading of the page.
        const Address = await signer.getAddress();
        setOwner(Address);
        const Token = new Contract(
          LinkTokenAddress,
          LINK.abi,
          signer
        );
        const Name = await Token.getInfo(Address)
        setName(Name)
        return signer;
      }
      return web3Provider;
    };
    
  
    const connectWallet = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // When used for the first time, it prompts the user to connect their wallet
        await getProviderOrSigner();
        setWalletConnected(true);
        await checIfAlreadyAMemberOfDAO();
        await getPriceOfMessage();
        await FetchAllTransactions();
        
  
      } catch (err) {
        console.error(err);
      }
    };
  

    const transferTokens = async () => {
        try {

            if (message == ""){
                window.alert("You havent entered any message");
            }

          const signer = await getProviderOrSigner(true);
          // Create a new instance of the Contract with a Signer, which allows
          // update methods
          const Token = new Contract(
            LinkTokenAddress,
            LINK.abi,
            signer
          );
          const Chat = new Contract(
            ChattingAddress,
            CHAT.abi,
            signer
          );
          const amountInWei = await Chat.cost_Of_mesage();
          const tx1 = await Token.transfer(ChattingAddress, amountInWei);
          setLoading(true);
          let _time =  new Date().toLocaleString();
          console.log(_time);
          let hashValue = tx1.hash;
          console.log(hashValue);

          if (hash != hashValue){
            hash = hashValue;
          }
          if (time != _time){
            time = _time;
          }
    
          if(tx1) {
            console.log("Transfer was successful");
            const tx2 = await Chat.CreateTransactionList(message,time,hash);
            console.log("Message has been processed");
            setLoading(true);
          // wait for the transaction to get mined
          await tx1.wait();
          await tx2.wait();
          await FetchAllTransactions();
          setLoading(false);
          } else {
            setLoading(false);
          }
          
        } catch (error) {
          console.log(error)
        }
      }
    
      const getPriceOfMessage = async () => {
        try {
          const provider = await getProviderOrSigner();
          const chat = new Contract(ChattingAddress,CHAT.abi,provider);
          const priceInBigNum = await chat.cost_Of_mesage();
          const price = priceInBigNum.toNumber();
          setPrice(price);
        } catch (e) {
          console.log(e)
        }
      }
    const FetchAllTransactions = async () => {
        try {
          const signer = await getProviderOrSigner(true);
          // Create a new instance of the Contract with a Signer, which allows
          // update methods
          const Chat = new Contract(
            ChattingAddress,
            CHAT.abi,
            signer
          );
          const data = await Chat.FetchAllTransactions();
          const transactions = await Promise.all(data.map(async i => {
           let transactionsList = {
            Index: i.transactId.toNumber(),
            Sender : i.sender,
            Name :i.Name,
            Time : i.time,
            Message :i.message,
            Hash:i.hashText
           }
          
           return transactionsList
         }))
        
         setAllTransactions(transactions);
         console.log("The transactions is been recorded");
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
          if(walletConnected && alredyAMemberOfDAO && allTransactions.length == 0) {
            return(
              <div className='container-fluid'> 
                <div className='row d-flex align-items-center justify-content-center' style={{flexDirection:'column'}}>
                  <div className='col-md-10' style={{marginTop:"30px",textAlign:"center",boxShadow:"0px 5px 10px 0px rgba(114, 113, 113, 0.452)",borderRadius:"10px", height:"470px", width:"100%"}}>
                    <span>
                      Messages will appear here write a message
                      for all the members of this DAO to see below.
                        <br/>
                       Each message you send cost one 1 OLT token
                    </span>
                  </div>
                  <div className='col-md-2 ' style={{boxShadow:"0px 5px 10px 0px rgba(114, 113, 113, 0.452)",borderRadius:"10px",height:"auto", width:"100%"}}>
                      <div className='row d-flex align-items-center justify-content-center' style={{padding:"5px 0"}}>
                      <div className='col-md-8'>
                            <input 
                            type="text" placeholder='Write in your message here...'
                            style={{padding:"10px", border:"none" , borderRadius:"10px",width:"100%"}}
                            onChange= {e => setMessage(e.target.value)}
                            />
                          </div>
                          <div className='col-md-3 '>
                            <button onClick={transferTokens} 
                            style={{ border:"none", textAlign:"center", 
                            padding:"10px 20px",color:"white", 
                            backgroundColor:"blue" , marginLeft:"10px" , borderRadius:"10px"}}>
                              {
                                loading ? (
                                  <>
                                   ...
                                  </>
                                ) : (
                                  <>
                                  SEND
                                  </>
                                )
                              }
                            </button>
                          </div>
                      </div>
                    </div>
                </div>
              </div>
            )
          }
          if(walletConnected && alredyAMemberOfDAO && allTransactions.length > 0) {
            return (
              <div className='container-fluid'>
                <div className='row'>
                  <div className='col-md-7'>
                    <div className='row d-flex align-items-center justify-content-center' style={{flexDirection:'column'}}>
                    <div className='col-md-10' style={{textAlign:"center",boxShadow:"0px 5px 10px 0px rgba(114, 113, 113, 0.452)",borderRadius:"10px", height:"470px", width:"100%"}}>
                       {

                          allTransactions.map((transaction , i ) => {
                        
                            return ( 
                              <div key={i} style={{  padding:"10px 5px",  margin:"20px" ,backgroundColor:"blanchedalmond", borderRadius:"10px"}} > 
                                <div  style={{padding:"0 5px" , display:"flex",justifyContent:"space-between"}}> 
                                <div style={{color:"black"}}> 
                                {
                                    transaction.Name == name ? (
                                      <div style={{ fontWeight:"700", color:"purple"}}>
                                      You
                                      </div>
                                    ):(
                                      transaction.Name
                                    )
                                }
                                  </div>
                                <div  style={{color:"black",fontWeight:"500" }}> 
                                {
                                    transaction.Message
                                     
                                } 
                                  </div>
                                
                                  
                                </div>
                                <div  style={{color:"grey", opacity:"0.5",
                                fontSize:"10px" }}> {
                                    transaction.Time
                                  } </div>
                              </div>
                            )})
                        }
                    </div>
                    <div className='col-md-2 my-2 ' style={{boxShadow:"0px 5px 10px 0px rgba(114, 113, 113, 0.452)",borderRadius:"10px" ,height:"auto", width:"100%"}}>
                      <div className='row d-flex align-items-center justify-content-center' style={{padding:"5px 0"}}>
                          <div className='col-md-8'>
                            <input 
                            type="text" placeholder='Write in your message here...'
                            style={{padding:"10px", border:"none" , borderRadius:"10px",width:"100%"}}
                            onChange= {e => setMessage(e.target.value)}
                            />
                          </div>
                          <div className='col-md-3 '>
                            <button onClick={transferTokens} 
                            style={{ border:"none", textAlign:"center", 
                            padding:"10px 20px",color:"white", 
                            backgroundColor:"blue" , marginLeft:"10px" , borderRadius:"10px"}}>
                              {
                                loading ? (
                                  <>
                                   ...
                                  </>
                                ) : (
                                  <>
                                  SEND
                                  </>
                                )
                              }
                            </button>
                          </div>
                      </div>
                    </div>
                </div>
                  </div>
                  <div className='col-md-5 ' style={{textAlign:"center"}}>
                    <h4  style={{margin:"20px 1px"}}>
                      Message Record 📁
                    </h4>
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
                  Time
                </th>
                
                <th className={styles.th}>
                  EtherScan
                </th>
                <th className={styles.th}>
                  Message 
                </th>
              </tr>

              {

                allTransactions.map((transaction , i ) => {
               
                  return (
                    (transaction.Sender == owner || transaction.Receiver == owner) && 

                     <tr key={i} className={styles.tr} style={{fontSize:"10px"}}>
                       <td className={styles.td}>
                         {serial++}
                       </td>
                       <td className={styles.td} style={{fontSize:"10px"}}>
                         {transaction.Index}
                       </td>
                      
                       <td className={styles.td} style={{fontSize:"10px"}}>
                         {transaction.Time 
                         }
                       </td>
                       
                       <td className={styles.td}>
                        <button style={{fontSize:"10px", textDecoration:"none",borderRadius:"10px" }}>
                          <a href={`https://rinkeby.etherscan.io/tx/${transaction.Hash}`} 
                           target="_blank" rel="noreferrer" style={{  textDecoration:"none" }}>
                            View in Explorer
                          </a>
                        </button>
                       </td>
                       <td className={styles.td} style={{fontSize:"10px"}}>
                         {transaction.Message}
                       </td>
                     </tr> 
                   )
                }
                
                    
                )
              }
               </tbody>
            </table>
         </div>
                  </div>
                </div>
              </div>
            )
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