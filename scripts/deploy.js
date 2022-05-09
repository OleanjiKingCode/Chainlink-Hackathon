const hre = require("hardhat");
const filesys = require("fs");


async function main() {

  const LinkToken = await hre.ethers.getContractFactory("OleanjiDAOLinkToken");
  const linktoken = await LinkToken.deploy("10000");

  await linktoken.deployed();

  console.log("LinkToken deployed to:", linktoken.address);
  const addr =linktoken.address;

  const Voting = await hre.ethers.getContractFactory("VotingDappByOleanji");
  const voting = await Voting.deploy(addr,"3000","3680");
  await voting.deployed();
  console.log("vote deployed to:", voting.address);
  // const addr2 =voting.address;

  // const VRF = await hre.ethers.getContractFactory("VRFv2Consumer");
  // const vrf = await VRF.deploy("3680",addr2);
  // await vrf.deployed();
  // const addr3 =vrf.address;
  // console.log("Vrf deployed to:", addr3);


  // const Keeper = await hre.ethers.getContractFactory("Counter");
  // const keepers = await Keeper.deploy("3000",addr2);
  // await keepers.deployed();
  // const addr4 =keepers.address;
  // console.log("Keepers deployed to:", addr4);

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
