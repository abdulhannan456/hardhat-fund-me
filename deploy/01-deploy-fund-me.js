const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
require("dotenv").config()
const {verify} = require("../utils/verify")

module.exports = async ({getNamedAccounts , deployments }) => {
    const { deploy , log} = deployments
    const { deployer } = await getNamedAccounts()
    const  chainId = network.config.chainId 

    let ethUsdPriceFeedAddress
    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }
    else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // what happens when we want to change chains ?
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe" , {
        from : deployer ,
        args : args, // put price feed address here 
        log : true ,
        waitConfirmations : network.config.blockConfirmations || 1 ,
    })
    log("---------------------------------------------------------")
    log(`Deployed by : "Hannan Ashraf"`)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address , args)
    }
    
}

module.exports.tags = ["all" , "fundme"]