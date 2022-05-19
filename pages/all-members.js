import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { ethers,providers, Contract } from "ethers";
import { useEffect, useRef, useState, useContext } from "react";
import { LinkTokenAddress, OwnersAddress } from "../constant"
import { OwnersAccount } from '../context';
import 'bootstrap/dist/css/bootstrap.css'
import { useRouter } from "next/router"
import LINK from '../artifacts/contracts/OleanjiDAOLinkToken.sol/OleanjiDAOLinkToken.json'




export default function AllMembers() {
    const [list, setList] =useState([])
    const[account,setAccount] = useState(null)
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const router =useRouter()
    const[serial, setSerial]= useState(1)
    
  
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
          network: "rinkeby",
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
            const token = new Contract(LinkTokenAddress,LINK.abi,signer)
         
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

    return (
        <div> 
            <div className='p-3' style={{fontSize:"29px", fontWeight:"700"}}>
            
            These are all the respectable members of this DAO 🎉🎉🎉
            <br/><br/>
            </div>
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
                               Name
                            </th>
                            <th className={styles.th}>
                                Address
                            </th>
                            </tr>


                    {
    
                        list.map((lists,i) => {
                            console.log(lists.Name)
                            return(
                                
                                <tr key={i} className={styles.tr} style={{fontSize:"14px"}}>
                                    <td className={styles.td}>
                                    {serial++}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"14px"}}>
                                        {lists.Index}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"14px"}}>
                                        {lists.Name}
                                    </td>
                                    <td className={styles.td} style={{fontSize:"14px"}}>
                                        {lists.Address}
                                    </td>
                                </tr>
                            
                            )
                        })
                    }

                </tbody>
            </table>
        </div>
        
            
        
        
    )

}