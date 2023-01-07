const { expect } = require('chai');
const { ethers } = require('hardhat');
const Web3 = require('web3');


describe('Token', () => {

  let challengeToken

  beforeEach(async () => {
    // Setup accounts
    [ercContract, person1, person2, person3] = await ethers.getSigners()
    
    // Deploy Token - with an total supply of 1,000,000 tokens
    const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
    challengeToken = await ChallengeToken.deploy(1000000)

    // Deploy Crowdfunding
    const campainGoal = 10 // Campain Goal - hard-coded
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
    const crowdfunding = await Crowdfunding.deploy(challengeToken.address, campainGoal)

  })

  describe('Deployment', () => {
    it('Challenge Token total supply', async () => {
        let result = await challengeToken.totalSupply()
        result = result/(10**18)
        expect(await result).to.be.equal(1000000) // change to the value passed to the constructor (deployment script)
    })
    it('Transfer token between accounts', async () => {
       let amountInWei = 100000

      let amount = Web3.utils.toWei(amountInWei.toString(), 'ether')
      await challengeToken.transfer(person1.address, amount, { from: ercContract.address })

      let balance = await challengeToken.balanceOf(person1.address)
      balance =  Web3.utils.fromWei(balance.toString(), 'ether')
      expect(balance).to.be.equal(amountInWei.toString())
    })
  })

})