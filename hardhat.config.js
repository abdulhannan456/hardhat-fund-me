require("dotenv").config();
require('hardhat-deploy');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COIN_MARKET_API_KEY = process.env.COIN_MARKET_API_KEY

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers : [
      {version : "0.8.8"},
      {version : "0.6.6"}
    ]
  },
  defaultNetwork : "hardhat" ,
  networks: {
    goerli : {
      url : GOERLI_RPC_URL ,
      accounts : [GOERLI_PRIVATE_KEY] ,
      chainId : 5 ,
      blockConfirmations : 6 ,
    },
    localhost : {
      url : "http://127.0.0.1:8545/" ,
      chainId : 31337,
    },
  },
  gasReporter: {
    enabled : true ,
    outputFile : "gas-reporter.txt",
    noColors : true ,
    currency : "USD",
    coinmarketcap : COIN_MARKET_API_KEY, 
    token : "ETH",
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
    },
  },
  mocha: {
    timeout: 500000,
  },
};
