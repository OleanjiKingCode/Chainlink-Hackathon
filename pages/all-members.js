import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import Link from 'next/link';
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress ,  abi} from "../constant"
import { OwnersAccount } from '../context';
import { useRouter } from "next/router"

export default function AllMembers() {
    const [list, setList] =useState([])
    const[account,setAccount] = useState(null)
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const router =useRouter()
  
    
  
    /*
      connectWallet: Connects the MetaMask wallet
    */
    const connectWallet = async () => {
      try {
      
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
       
       let acc = signer.getAddress();
       setAccount(acc);
        await FetchMembers(signer);
       
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
          network: "kovan",
          providerOptions: {},
          disableInjectedProvider: false,
        });
        connectWallet();
      }
    }, [walletConnected]);
  
 

    const FetchMembers= async(signer) =>  {
        try {
            // const signer = await getProviderOrSigner(true);
            // const provider = new ethers.providers.Web3Provider(window.ethereum);
            //  const signer = provider.getSigner();
            const token = new Contract(LinkTokenAddress,abi,signer)
         
            const data = await token.fetchMembers();
            // console.log("AScc")

            const Members = await Promise.all(data.map(async i => {
     
      
                let MemberList = {
                    Index: i.memberId.toNumber(),
                    Name:i.name,
                    Address: i.memberAddress,
                    Balance: ethers.utils.formatEther(i.balance)
                }
                console.log(i.name)
                return MemberList
            }))
            
            setList(Members);
            console.log(list);
        } catch (error) {
            console.log(error)
        }
    };

const renderButton = () =>{
    if (account === OwnersAddress){
        return (
            router.push('/')
        )
    }
}

    return (
        
        <div>
            {/* {renderButton()} */}
            <Head>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
      </link>
</Head>
        {/* <div>
            {renderButton()}
        </div> */}
        {
        
            list.map((lists,i) => {

                return(
                    <div key={i}>
                        <p>
                           {lists.Index}
                        </p>
                        <p>
                            {lists.Name}
                        </p>

                        <p>
                            {lists.Address}
                        </p>
                        <p>
                            {lists.Balance}
                        </p>
                    </div>
                )
            })
        }
        </div>
    )

}