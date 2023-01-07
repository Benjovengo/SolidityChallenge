// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Deploy Token - with an total supply of 1,000,000 tokens
  const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
  const challengeToken = await ChallengeToken.deploy(1000000)
  await challengeToken.deployed()

  console.log(`Deployed Challenge Token Contract at: ${challengeToken.address}`)
  console.log(`Total supply: ${challengeToken.totalSupply()} tokens\n`)

  // Deploy Crowdfunding
  const campainGoal = 10 // Campain Goal - hard-coded
  const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
  const crowdfunding = await Crowdfunding.deploy(challengeToken.address, campainGoal)
  await crowdfunding.deployed()

  console.log(`Deployed Crowdfunding Contract at: ${crowdfunding.address}`)
  console.log(`Total supply: ${challengeToken.totalSupply()} tokens\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});