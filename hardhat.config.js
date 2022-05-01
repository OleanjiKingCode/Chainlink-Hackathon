require("@nomiclabs/hardhat-waffle");

require("dotenv").config({ path: ".env" });

const INFURA_API_URL = process.env.INFURA_API_URL;

const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY;
const INFURA_API_URL_1 = process.env.INFURA_API_URL_1;

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;


module.exports = {
  solidity: "0.8.7",
  networks: {
    hardhat:{
      chainId:1337
    },
    rinkeby:{
      url: INFURA_API_URL_1,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    kovan:{
      url: INFURA_API_URL,
      accounts: [KOVAN_PRIVATE_KEY],
    },
  },
};
