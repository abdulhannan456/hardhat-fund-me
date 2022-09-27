const { assert, expect } = require("chai")
const {deployments, ethers, getNamedAccounts} = require ("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip :
    describe("FundMe" , function ( ) {
        let fundMe 
        let deployer 
        let mockV3Aggregator
        let sendValue = ethers.utils.parseEther("1")

        beforeEach( async function () { 
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe" , deployer)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator" , deployer)
        })

        describe("Constructor" , function (){
            it("Sets the aggregator address correctly" , async function ( ) {
                const response = await fundMe.getpriceFeed()
                assert.equal(response , mockV3Aggregator.address)
            })
        })

        describe("fund" , function (){
            it("Fails if you dont send enough ETH" , async function (){
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })

            it("updated the amount funded data structure" , async function () {
                await fundMe.fund({value : sendValue})
                const response = await fundMe.getaddressToAmountFunded(deployer)
                assert.equal(response.toString() , sendValue.toString())
            })

            it("Adds funder to array of getFunders" , async function (){
                await fundMe.fund({value : sendValue})
                const response = await fundMe.getFunders(0)
                assert.equal(response , deployer)
            })
        })

        describe("withdraw" , function(){
            beforeEach(async function(){
                await fundMe.fund({value : sendValue})
            })

            it("Withdraw ETH from a single funder", async function (){
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Act 
                const transactionResponse = await fundMe.withdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed , effectiveGasPrice} = transactionReciept
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Assert
                assert.equal(endingFundMeBalance , 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString() , 
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("allows us to withdraw ETH with multiple getFunders" , async function(){
                //Arrange
                const accounts = await ethers.getSigners()
                for (let i = 1 ; i < 6 ; i++){
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({value : sendValue})
                }
                
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed , effectiveGasPrice} = transactionReciept
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Assert
                assert.equal(endingFundMeBalance , 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString() , 
                    endingDeployerBalance.add(gasCost).toString()
                )

                //we have to make sure that the fnders are reset properly
                await expect(fundMe.getFunders(0)).to.be.reverted
                for(let i=0 ; i < 6 ; i++){
                    assert.equal(
                        await fundMe.getaddressToAmountFunded(accounts[i].address) ,
                        0
                    )
                }
            })

            it("Only allows owner to withdraw" , async function(){
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
                    "FundMe__NotOwner"
                )
            })

            it("cheaper withdraw testing" , async function(){
                //Arrange
                const accounts = await ethers.getSigners()
                for (let i = 1 ; i < 6 ; i++){
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({value : sendValue})
                }
                
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed , effectiveGasPrice} = transactionReciept
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Assert
                assert.equal(endingFundMeBalance , 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString() , 
                    endingDeployerBalance.add(gasCost).toString()
                )

                //we have to make sure that the fnders are reset properly
                await expect(fundMe.getFunders(0)).to.be.reverted
                for(let i=0 ; i < 6 ; i++){
                    assert.equal(
                        await fundMe.getaddressToAmountFunded(accounts[i].address) ,
                        0
                    )
                }
            })

            it("Withdraw ETH from a single funder", async function (){
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Act 
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed , effectiveGasPrice} = transactionReciept
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Assert
                assert.equal(endingFundMeBalance , 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString() , 
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

        })
    })
