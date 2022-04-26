const hre = require("hardhat");
const filesys = require("fs");

async function main() {

  const LinkToken = await hre.ethers.getContractFactory("OleanjiDAOLinkToken");
  const linktoken = await LinkToken.deploy("10000");

  await linktoken.deployed();

  console.log("LinkToken deployed to:", linktoken.address);

  filesys.writeFileSync('./constant.js' , `
  export const LinkTokenAddress ="${linktoken.address}"
  export const OwnersAddress = "${linktoken.signer.address}"
  
  `)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
