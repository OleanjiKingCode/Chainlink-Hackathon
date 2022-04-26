require("@nomiclabs/hardhat-waffle");

require("dotenv").config({ path: ".env" });

const INFURA_API_URL = process.env.INFURA_API_URL;

const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY;


module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat:{
      chainId:1337
    },
    kovan:{
      url: INFURA_API_URL,
      accounts: [KOVAN_PRIVATE_KEY],
    },
  },
};
