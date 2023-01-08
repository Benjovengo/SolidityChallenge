// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");
const Web3 = require('web3');

// Helper Functions
const toWei = (n) => {
  return Web3.utils.toWei(n.toString(), 'ether')
}

async function main() {
    // Setup accounts
    [firstAccount, person1, person2, person3] = await ethers.getSigners()
    
  // Deploy Token - with an total supply of 1,000,000 tokens
  const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
  const challengeToken = await ChallengeToken.deploy(1000000)
  await challengeToken.deployed()
  console.log(`Deployed Challenge Token Contract at: ${challengeToken.address}`)
  console.log(`Total supply: ${await challengeToken.totalSupply()} tokens\n`)

  // Deploy Crowdfunding
  const campainGoal = 10 // Campain Goal - hard-coded
  const deadline = 100 // Campain Goal - hard-coded
  const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
  const crowdfunding = await Crowdfunding.deploy(challengeToken.address, campainGoal, deadline)
  await crowdfunding.deployed()
  console.log(`Deployed Crowdfunding Contract at: ${crowdfunding.address}`)

    // Transfer tokens to accounts so all accounts have tokens
    let amountInWei = 100000 // value in CHAL
    let amount = toWei(amountInWei)

    // transfer fund to person1
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});