const { expect } = require('chai');
const { ethers } = require('hardhat');
const Web3 = require('web3');

// Helper Functions
const toWei = (n) => {
  return Web3.utils.toWei(n.toString(), 'ether')
}

const fromWei = (n) => {
  return Web3.utils.fromWei(n.toString(), 'ether')
}


/* Tests on deployment */
describe('Deployment', () => {

  let campainGoal
  let challengeToken
  let crowdfunding

  beforeEach(async () => {
    // Setup accounts
    [firstAccount, person1, person2, person3] = await ethers.getSigners()
    
    // Deploy Token - with an total supply of 1,000,000 tokens
    const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
    challengeToken = await ChallengeToken.deploy(100)
  })

  describe('Token Contract', () => {

    it('Challenge Token total supply', async () => {
        let result = await challengeToken.totalSupply()
        result = result/(10**18)
        expect(await result).to.be.equal(100) // change to the value passed to the constructor (deployment script)
    })

    it('Transfer token between accounts', async () => {
      let amountInWei = 100000
      let amount = toWei(amountInWei)
      await challengeToken.transfer(person1.address, amount, { from: firstAccount.address })

      let balance = await challengeToken.balanceOf(person1.address)
      balance =  Web3.utils.fromWei(balance.toString(), 'ether')
      expect(balance).to.be.equal(amountInWei.toString())
    })



  })


})
