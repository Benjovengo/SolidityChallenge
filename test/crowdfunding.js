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

  })

  it('Token deployment', async () => {
    const tokenAddress = await challengeToken.address
    assert.notEqual(tokenAddress, 0x0)
    assert.notEqual(tokenAddress, '')
    assert.notEqual(tokenAddress, null)
    assert.notEqual(tokenAddress, undefined)
    console.log('      Token Contrct Address: ', tokenAddress)
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

})
