// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
//const hre = require("hardhat");
const Web3 = require('web3');

// Helper Functions
const toWei = (n) => {
  return Web3.utils.toWei(n.toString(), 'ether')
}

const fromWei = (n) => {
  return Web3.utils.fromWei(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  [firstAccount, person1, person2, person3] = await ethers.getSigners()
  
  // Deploy Token - with an total supply of 1,000,000 tokens
  const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
  const challengeToken = await upgrades.deployProxy(ChallengeToken, [1000000], {initializer: 'initialize'})
  await challengeToken.deployed()
  console.log(`Deployed Challenge Token Contract at: ${challengeToken.address}`)
  console.log(`Total supply: ${fromWei(await challengeToken.totalSupply())} tokens\n`)

  // Deploy Crowdfunding
  let campainGoal = toWei(50000) // Campain Goal - hard-coded
  let deadline = 30 // Campain Deadline - hard-coded
  const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
  const crowdfunding = await upgrades.deployProxy(Crowdfunding, [challengeToken.address, campainGoal, deadline], {initializer: 'initialize'})
  await crowdfunding.deployed()
  console.log(`Deployed Crowdfunding Contract at: ${crowdfunding.address}`)

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});