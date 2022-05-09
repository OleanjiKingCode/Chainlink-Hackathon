const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.only("Joining", function () {


  it("Contract Addresses", async function () { 
    const Token = await ethers.getContractFactory("OleanjiDAOLinkToken");
    const token = await Token.deploy("10000");
    await token.deployed();
    const CA= token.address;
    console.log(CA);

    const Voting = await ethers.getContractFactory("VotingDappByOleanji");
    const voting = await Voting.deploy(CA,3000,3680);
    await voting.deployed();
    const CA2= voting.address;
    console.log("this is the address you want", CA2);
    const owner =  await voting.signer.getAddress()

    

    const addr = await token.signer.getAddress()
    const values = await token.balanceOf(addr)
    const newValue =ethers.utils.formatEther(values);

    const[_,buyerAddress,Address3] = await ethers.getSigners()

    // await token.joinMembershipAward()

    const transact = await token.getPrice();
    const newone = transact.toString();
    ////////address1
    await token.connect(buyerAddress).joinMembership("address1",{value:newone })

    ////////address2
    await token.connect(Address3).joinMembership("address2",{value:newone })

    const items = await token.fetchMembers()
    console.log(items)
    const name = await token.connect(buyerAddress).getInfo();
    console.log(name);
    const addresssss = await buyerAddress.getAddress();
    // new value of the signers balance
    const value2 = await token.balanceOf(addresssss)
    const newValue2 =ethers.utils.formatEther(value2);
    console.log(newValue2)
   

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
/////////////////////////VOTING TIME /////////////////////////////////
/////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

    const transacts = await voting.getVotingPrice();
    const newones = transacts.toString();
    console.log(newones)
    const utils = ethers.utils.parseEther(newones);

    await token.connect(buyerAddress).approve(CA2, utils.toString())

    await token.connect(Address3).approve(CA2, utils.toString())
    console.log(utils);
     
    // await voting.startApplication()
    let tx = await voting.connect(buyerAddress).jointhecandidateList("yippee" , utils);
    console.log(tx);
    tx =  await voting.connect(Address3).jointhecandidateList("yippee" , utils);
    console.log(tx);

    const list = await voting.fetchVotersList();
    console.log(list)

    let balance = await token.balanceOf(addresssss);
    balance = (ethers.utils.formatEther(balance)).toString();
    // const delay = ms => new Promise(res => setTimeout(res, ms)); 
    // await delay(300000);
    const ukeep = await voting.s_requestId();
    console.log(ukeep);
    const random = await voting.s_randomLuck();
    
    console.log(random);

  expect(balance).to.equal("350.0");
  });


  
});
