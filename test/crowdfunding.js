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

  // Variables
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
    let amountInCHAL = 5
    let amount = toWei(amountInCHAL)
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
      let amountInCHAL = 5
      let amount = toWei(amountInCHAL)

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

    it('Goal', async () => {
      expect(crowdfunding.goal()).to.be.not.equal(10)
  })
  })
})





/* Tests on crowdfunding */
describe('Crowdfunding Funcionalities', () => {

  // Variables
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

    // transfer fund to person2
    transaction = await challengeToken.connect(firstAccount).approve(person2.address, amount)
    await transaction.wait()
    await challengeToken.transfer(person2.address, amount, { from: firstAccount.address })

    // transfer fund to person3
    transaction = await challengeToken.connect(firstAccount).approve(person3.address, amount)
    await transaction.wait()
    await challengeToken.transfer(person3.address, amount, { from: firstAccount.address })

    // Deploy Crowdfunding
    campainGoal = 10 // Campain Goal - hard-coded
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
    crowdfunding = await Crowdfunding.deploy(challengeToken.address, toWei(campainGoal))
  })

  describe('Functions', () => {
    it('Pledge', async () => {
      let amountInCHAL = 5
      let amount = toWei(amountInCHAL)
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()

      await crowdfunding.connect(person1).pledge(amount)
      
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('0')
    })

    it('Get money from crowdfunding', async () => {
      let amountInCHAL = 3
      let amount = toWei(amountInCHAL)
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amount)
      await transaction.wait()
      transaction = await challengeToken.connect(person3).approve(crowdfunding.address, amount)
      await transaction.wait()
  
      // add token to crowdfunding
      await crowdfunding.connect(person1).pledge(amount)
      await crowdfunding.connect(person2).pledge(toWei(2))

      // take out money
      await crowdfunding.connect(person1).takeOut(toWei(1))
      
      // get balance of the accounts after pledging and getting back part of the funds
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('3')

      balance = await challengeToken.balanceOf(person2.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('3')
    })

    it('Cancel crowdfunding', async () => {
      let amountInCHAL = 2
      let amount = toWei(amountInCHAL)
      // transfer funds from different accounts
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amount)
      await transaction.wait()
      transaction = await challengeToken.connect(person3).approve(crowdfunding.address, amount)
      await transaction.wait()
  
      // pledge
      await crowdfunding.connect(person1).pledge(amount)
      await crowdfunding.connect(person2).pledge(amount)
      await crowdfunding.connect(person3).pledge(amount)
      
  
      await crowdfunding.connect(firstAccount).cancel() // error if any other account - OK
      
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('5')

      balance = await challengeToken.balanceOf(person2.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('5')

      balance = await challengeToken.balanceOf(person3.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('5')
    })

    it('Claim funds', async () => {
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, toWei(4))
      await transaction.wait()
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, toWei(3))
      await transaction.wait()
      transaction = await challengeToken.connect(person3).approve(crowdfunding.address, toWei(5))
      await transaction.wait()

      // contract approval
      transaction = await challengeToken.connect(firstAccount).approve(crowdfunding.address, toWei(15))
      await transaction.wait()
  
      // add token to crowdfunding
      await crowdfunding.connect(person1).pledge(toWei(4))
      await crowdfunding.connect(person2).pledge(toWei(3))
      await crowdfunding.connect(person2).pledge(toWei(5))

      // take out money
      await crowdfunding.connect(firstAccount).claim()
      
      // get balance of the accounts after pledging and getting back part of the funds
      let balance = await challengeToken.balanceOf(firstAccount.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('97')

      balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('1')

      balance = await challengeToken.balanceOf(person2.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('2')

      balance = await challengeToken.balanceOf(person3.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('0')
    })

  })

  

})

