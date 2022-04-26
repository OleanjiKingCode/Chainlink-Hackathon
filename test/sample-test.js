const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Joining", function () {
  it("Should return the new part of membercount", async function () {
    const Token = await ethers.getContractFactory("OleanjiDAOLinkToken");
    const token = await Token.deploy("10000");
    await token.deployed();
   
    const addr = await token.signer.getAddress()
    const value = await token.balanceOf(addr)
    const newValue =ethers.utils.formatEther(value);
  
   
   
    
    const[_,buyerAddress] = await ethers.getSigners()

    // await token.joinMembershipAward()

    
    await token.connect(buyerAddress).joinMembership()

   
    const items = await token.fetchMembers()
    console.log(items)

   
    // new value of the signers balance
    const value2 = await token.balanceOf(addr)
    const newValue2 =ethers.utils.formatEther(value2);
   
    console.log(newValue2);
    expect(newValue).to.equal("10000");
  });
});
