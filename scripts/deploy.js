const hre = require("hardhat");
const filesys = require("fs");


async function main() {

  const LinkToken = await hre.ethers.getContractFactory("OleanjiDAOLinkToken");
  const linktoken = await LinkToken.deploy("10000");

  await linktoken.deployed();

  console.log("LinkToken deployed to:", linktoken.address);
  const addr =linktoken.address;

  const Voting = await hre.ethers.getContractFactory("VotingDappByOleanji");
  const voting = await Voting.deploy(addr);

  await voting.deployed();

  const VRF = await hre.ethers.getContractFactory("VRFv2Consumer");
  const vrf = await VRF.deploy("3680");

  await vrf.deployed();


  filesys.writeFileSync('./constant.js' , `
  export const LinkTokenAddress ="${linktoken.address}"
  export const OwnersAddress = "${linktoken.signer.address}"


  export const VotingAddress ="${voting.address}"
  export const VRFAddress ="${vrf.address}"
  `)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
