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

  const Chat = await hre.ethers.getContractFactory("chatting");
  const chatting = await Chat.deploy(LinkCA);
  await chatting.deployed();
  console.log("The chatting Contract is:", chatting.address);
  
  const OCH = await hre.ethers.getContractFactory("OCH");
  const metadata = "ipfs://Qmf2K9v8SLusJc6yyqRp7op8aRUc9HsxPQKDHdqCNxwqay/"

  const och = await OCH.deploy(metadata,LinkCA);
  await och.deployed();
  console.log("OCH Contract is:", och.address);


  filesys.writeFileSync('./constant.js' , `
  export const LinkTokenAddress ="${linktoken.address}"
  export const OwnersAddress = "${linktoken.signer.address}"
  export const VotingAddress ="${voting.address}"
  export const ChattingAddress ="${chatting.address}"
  export const NFTAddress ="${och.address}"
  `)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
