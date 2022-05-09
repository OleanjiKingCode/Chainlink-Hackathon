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

}