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

    // transfer fund to person1
    let amountInWei = 5
    let amount = toWei(amountInWei)
    let transaction = await challengeToken.connect(firstAccount).approve(person1.address, amount)
    await transaction.wait()
    await challengeToken.transfer(person1.address, amount, { from: firstAccount.address })

    // Deploy Crowdfunding
    campainGoal = 10 // Campain Goal - hard-coded
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
    crowdfunding = await Crowdfunding.deploy(challengeToken.address, campainGoal)

  })

  describe('Token Contract', () => {
    it('Challenge Token total supply', async () => {
        let result = await challengeToken.totalSupply()
        result = Number(fromWei(result))
        expect(await result).to.be.equal(100) // change to the value passed to the constructor (deployment script)
    })

    it('Transfer token between accounts', async () => {
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('5')
    })

    it('Transfer back', async () => {
      let amountInWei = 5
      let amount = toWei(amountInWei)

      let transaction = await challengeToken.connect(person1).approve(firstAccount.address, amount)
      await transaction.wait()

      await challengeToken.transferFrom(person1.address, firstAccount.address, amount)

      let balance = await challengeToken.balanceOf(firstAccount.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('100')
    })
  })

  describe('Crowdfunding Contract', () => {
    it('Deployment', async () => {
        expect(crowdfunding.address).to.be.not.equal('')
    })
  })
})

