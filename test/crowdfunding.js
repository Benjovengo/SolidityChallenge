const { expect, assert } = require('chai');
const { ethers } = require('hardhat');
const Web3 = require('web3');

// Helper Functions
const toWei = (n) => {
  return Web3.utils.toWei(n.toString(), 'ether')
}

const fromWei = (n) => {
  return Web3.utils.fromWei(n.toString(), 'ether')
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
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
    challengeToken = await upgrades.deployProxy(ChallengeToken, [1000000], {initializer: 'initialize'})

    // Deploy Crowdfunding
    let campainGoal = toWei(1000) // Campain Goal - hard-coded
    let deadline = 100 // Campain Deadline - hard-coded
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
    crowdfunding = await upgrades.deployProxy(Crowdfunding, [challengeToken.address, campainGoal, deadline], {initializer: 'initialize'})
  })

  it('Token deployment', async () => {
    const tokenAddress = await challengeToken.address
    assert.notEqual(tokenAddress, 0x0)
    assert.notEqual(tokenAddress, '')
    assert.notEqual(tokenAddress, null)
    assert.notEqual(tokenAddress, undefined)
    console.log('      Token Contract Address: ', tokenAddress)
  })

  it('Token deployment', async () => {
    const userAddress = firstAccount.address // defined like that to easily swith to other account
    assert.notEqual(userAddress, 0x0)
    assert.notEqual(userAddress, '')
    assert.notEqual(userAddress, null)
    assert.notEqual(userAddress, undefined)
    console.log('      User Contrct Address: ', userAddress)
  })
  
  it('Get balance of owner', async () => {
    const balance = await challengeToken.balanceOf(firstAccount.address)
    const result = fromWei(balance)
    expect(result).to.be.equal('1000000')

    console.log('      Owner balance: ', result)
  })

  it('Transfer funds from owner', async () => {
    let amountInCHAL = 10
    let amount = toWei(amountInCHAL)
    let transaction = await challengeToken.connect(firstAccount).approve(person1.address, amount)
    await transaction.wait()
    await challengeToken.transfer(person1.address, amount, { from: firstAccount.address })

    // get balance of person1
    const balance = await challengeToken.balanceOf(person1.address)
    const result = fromWei(balance)
    expect(result).to.be.equal('10')

    console.log('      Person1 balance: ', result)
  })

  it('Transfer funds from person1', async () => {
    // add funds to person1
    let amountInCHAL = 10
    let amount = toWei(amountInCHAL)
    let transaction = await challengeToken.connect(firstAccount).approve(person1.address, amount)
    await transaction.wait()
    await challengeToken.transfer(person1.address, amount, { from: firstAccount.address })

    // transfer funds from person1 to person2
    amountInCHAL = 5
    amount = toWei(amountInCHAL)
    transaction = await challengeToken.connect(person1).approve(person2.address, amount)
    await transaction.wait()
    await challengeToken.connect(person1).transfer(person2.address, amount)

    // get balance of person2
    const balance = await challengeToken.balanceOf(person2.address)
    const result = fromWei(balance)
    expect(result).to.be.equal('5')

    console.log('      Person2 balance: ', result)
  })

  it('Crowdfunding deployment', async () => {
    const crowdfundingAddress = await crowdfunding.address
    assert.notEqual(crowdfundingAddress, 0x0)
    assert.notEqual(crowdfundingAddress, '')
    assert.notEqual(crowdfundingAddress, null)
    assert.notEqual(crowdfundingAddress, undefined)
    console.log('      Crowdfunding Contract Address: ', crowdfundingAddress)
  })

  it('Goal', async () => {
    expect(crowdfunding.goal()).to.be.not.equal(10)
  })

  it('Deadline', async () => {
    expect(crowdfunding.deadline()).to.be.not.equal(100)
  })
})





/* Tests on crowdfunding */
describe('Crowdfunding Funcionalities', () => {
  // before each test
  beforeEach(async () => {
    // Setup accounts
    [firstAccount, person1, person2, person3] = await ethers.getSigners()

    // Deploy Token - with an total supply of 1,000,000 tokens
    const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
    challengeToken = await upgrades.deployProxy(ChallengeToken, [1000000], {initializer: 'initialize'})

    // Deploy Crowdfunding
    let campainGoal = toWei(50000) // Campain Goal - hard-coded
    let deadline = 30 // Campain Deadline - hard-coded
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
    crowdfunding = await upgrades.deployProxy(Crowdfunding, [challengeToken.address, campainGoal, deadline], {initializer: 'initialize'})

    // Transfer funds to accounts
    let amountInCHAL = 100000
    let amount = toWei(amountInCHAL)
    // transfer to person1
    let transaction = await challengeToken.connect(firstAccount).approve(person1.address, amount)
    await transaction.wait()
    await challengeToken.connect(firstAccount).transfer(person1.address, amount)
    // transfer to person2
    transaction = await challengeToken.connect(firstAccount).approve(person2.address, amount)
    await transaction.wait()
    await challengeToken.connect(firstAccount).transfer(person2.address, amount)
    // transfer to person3
    transaction = await challengeToken.connect(firstAccount).approve(person3.address, amount)
    await transaction.wait()
    await challengeToken.connect(firstAccount).transfer(person3.address, amount)
  })

  describe('Testing Functions', () => {
    it('Pledge', async () => {
      let amountInCHAL = 5000
      let amount = toWei(amountInCHAL)
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()

      await crowdfunding.connect(person1).pledge(amount)
      
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('95000')
    })

    it('Withdraw', async () => {
      let amountInCHAL = 15000
      let amount = toWei(amountInCHAL)
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amount)
      await transaction.wait()
      transaction = await challengeToken.connect(person3).approve(crowdfunding.address, amount)
      await transaction.wait()
  
      // add token to crowdfunding
      await crowdfunding.connect(person1).pledge(amount)
      await crowdfunding.connect(person2).pledge(amount)

      // take out money
      await crowdfunding.connect(person1).withdraw(toWei(8000))
      await crowdfunding.connect(person2).withdraw(toWei(2000))
      
      // get balance of the accounts after pledging and getting back part of the funds
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('93000')

      balance = await challengeToken.balanceOf(person2.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('87000')
    })

    it('Cancel crowdfunding', async () => {
      let amountInCHAL = 10000
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
      expect(balance).to.be.equal('100000')

      balance = await challengeToken.balanceOf(person2.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('100000')

      balance = await challengeToken.balanceOf(person3.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('100000')
    })

    it('Claim funds', async () => {
      const amountP1 = toWei(25000)
      const amountP2 = toWei(10000)
      const amountP3 = toWei(20000)
      
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amountP1)
      await transaction.wait()
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amountP2)
      await transaction.wait()
      transaction = await challengeToken.connect(person3).approve(crowdfunding.address, amountP3)
      await transaction.wait()
  
      // add token to crowdfunding
      await crowdfunding.connect(person1).pledge(amountP1)
      await crowdfunding.connect(person2).pledge(amountP2)
      await crowdfunding.connect(person3).pledge(amountP3)

      
      // contract approval
      let total = await crowdfunding.totalRaised()
      transaction = await challengeToken.connect(firstAccount).approve(crowdfunding.address, total)
      await transaction.wait()


      // approve transfer from contract to first account address
      await challengeToken.allowance(firstAccount.address, crowdfunding.address)


      // cash out
      await crowdfunding.connect(firstAccount).claim()
      
      // get balance of the accounts after pledging and getting back part of the funds
      let balance = await challengeToken.balanceOf(firstAccount.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('755000')

      balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('75000')

      balance = await challengeToken.balanceOf(person2.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('90000')

      balance = await challengeToken.balanceOf(person3.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('80000')
    })
  })

  describe('Testing Funcionalities', () => {
    it('reached deadline', async () => {
      let amountInCHAL = 25000
      let amount = toWei(amountInCHAL)
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()
      await crowdfunding.connect(person1).pledge(amount)
      
      // wait for the deadline and then try to pledge
      await delay(10000)
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amount)
      await transaction.wait()
      await crowdfunding.connect(person2).pledge(amount)

      // only the first person will be able to contribute to the campain
      expect(crowdfunding.totalRaised()).to.be.not.equal(amount)
    })

    it('withdraw not working after goal has been reached', async () => {
      let amountInCHAL = 25000
      let amount = toWei(amountInCHAL)
      // first contribution
      let transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
      await transaction.wait()
      await crowdfunding.connect(person1).pledge(amount)
      // secont contribution
      transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amount)
      await transaction.wait()
      await crowdfunding.connect(person2).pledge(amount)

      try {
        // try to withdraw after the goal has been reached
        await crowdfunding.connect(person1).withdraw(toWei(20000))
      } catch(error) {
        //console.log(error)
      }

      // balance of person1 - withdraw not successfull
      let balance = await challengeToken.balanceOf(person1.address)
      balance =  fromWei(balance.toString())
      expect(balance).to.be.equal('75000')
    })

  })
})