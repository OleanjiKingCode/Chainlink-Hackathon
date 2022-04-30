const hre = require("hardhat");
const filesys = require("fs");


async function main() {

  const LinkToken = await hre.ethers.getContractFactory("OleanjiDAOLinkToken");
  const linktoken = await LinkToken.deploy("10000");
  const abitoken = "";
  await linktoken.deployed();

  console.log("LinkToken deployed to:", linktoken.address);
  const addr =linktoken.address;

  const Voting = await hre.ethers.getContractFactory("VotingDappByOleanji");
  const voting = await Voting.deploy(addr);
  const abivoting = "";
  await voting.deployed();

  filesys.writeFileSync('./constant.js' , `
  export const LinkTokenAddress ="${linktoken.address}"
  export const OwnersAddress = "${linktoken.signer.address}"
  export const abiToken = "${abitoken }"

  export const VotingAddress ="${voting.address}"
  export const abiVoting = "${abivoting }"
  `)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
