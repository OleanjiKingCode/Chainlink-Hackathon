import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress,VotingAddress,ChattingAddress} from "../constant"
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
  
  
  
    const web3ModalRef = useRef();
  
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
            const tx2 = await Token.CreateTransactionList(message,time,hash);
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


      const renderButton = () => {

      }
      return (
          <> 
          </>
      ) 

}