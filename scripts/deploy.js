const hre = require("hardhat");
const filesys = require("fs");


async function main() {

  const LinkToken = await hre.ethers.getContractFactory("OleanjiDAOLinkToken");
  const linktoken = await LinkToken.deploy("10000");

  await linktoken.deployed();

  console.log("LinkToken deployed to:", linktoken.address);
  const LinkCA =linktoken.address;

  const Voting = await hre.ethers.getContractFactory("VotingDappByOleanji");
  const voting = await Voting.deploy(LinkCA,"900","4254");
  await voting.deployed();
  console.log("vote deployed to:", voting.address);

  filesys.writeFileSync('./constant.js' , `
  export const LinkTokenAddress ="${linktoken.address}"
  export const OwnersAddress = "${linktoken.signer.address}"
  export const VotingAddress ="${voting.address}"
  
  `)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
