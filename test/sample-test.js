const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Joining", function () {
  it("Should return balance of owner to be 350", async function () {
    const Token = await ethers.getContractFactory("OleanjiDAOLinkToken");
    const token = await Token.deploy("10000");
    await token.deployed();
    const CA= token.address;

    const Voting = await ethers.getContractFactory("VotingDappByOleanji");
    const voting = await Voting.deploy(CA);
    await voting.deployed();
    const CA2= voting.address;


    const addr = await token.signer.getAddress()
    const values = await token.balanceOf(addr)
    const newValue =ethers.utils.formatEther(values);

    const[_,buyerAddress] = await ethers.getSigners()

    // await token.joinMembershipAward()

    const transact = await token.getPrice();
    const newone = transact.toString();
    await token.connect(buyerAddress).joinMembership("chicken",{value:newone })

    const items = await token.fetchMembers()
    console.log(items)
    const name = await token.connect(buyerAddress).getInfo();
    console.log(name);
   const addresssss = await buyerAddress.getAddress();
    // new value of the signers balance
    const value2 = await token.balanceOf(addresssss)
    const newValue2 =ethers.utils.formatEther(value2);
    console.log(newValue2)
   


    const transacts = await voting.connect(buyerAddress).getVotingPrice();
    const newones = transacts.toString();
    console.log(newones)
    const utils = ethers.utils.parseEther(newones);
    await token.connect(buyerAddress).approve(CA2, utils.toString())
    console.log(utils)
    const tx = await voting.connect(buyerAddress).jointhecandidateList("yippee" , utils);
    console.log(tx);
    let balance = await token.balanceOf(addresssss);
    balance = (ethers.utils.formatEther(balance)).toString();

  expect(balance).to.equal("350.0");
  });
});
