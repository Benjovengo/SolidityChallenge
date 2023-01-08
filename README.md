# ERC-20 Crowdfunding Challenge

This is a smart contract for a crowdfunding campaign that uses a custom ERC-20 token called _ChallengeToken_. It allows backers to contribute to the campaign and receive ChallengeTokens in return. The campaign has a goal and a deadline, and if the goal is not reached by the deadline, the funds will be returned to the backers.

## Introduction

### Prerequisites

- Node.js and npm: https://nodejs.org/
- Hardhat: https://hardhat.org/

### Install

1. Clone this repository: `git clone https://github.com/Benjovengo/SolidityChallenge.git`
2. Install the dependencies: `npm install`

### Deploy

1. Start a local Ethereum network with Hardhat: `npx hardhat node`
2. Open a new terminal
3. Compile the contracts: `npx hardhat compile`
4. Migrate the contracts to the local network: `npx hardhat run scripts/deploy.js --network localhost`

[![asciicast](https://asciinema.org/a/550350.svg)](https://asciinema.org/a/550350)

### Test

1. Start a local Ethereum network with Hardhat: `npx hardhat node`
2. Run the tests: `npx hardhat test`

[![asciicast](https://asciinema.org/a/550347.svg)](https://asciinema.org/a/550347)

### Use

1. Start a local Ethereum network with Hardhat: `npx hardhat node`
2. Use the deployed contract by interacting with it through a _web3 interface_, such as the Hardhat console: `npx hardhat console`

Use this sample interaction with the crowdfunding contract via the hardhat console as a guide on how to start interacting with contracts using the console. **Note:** _truffle_ also has a similar funcionality.

```console
npx hardhat compile

npx hardhat console

# Load requirement
const Web3 = require('web3');

# Setup accounts
[firstAccount, person1, person2] = await ethers.getSigners()


# Deploy Token Contract
const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
const challengeToken = await upgrades.deployProxy(ChallengeToken, [1000000], {initializer: 'initialize'})


# Deploy Crowdfunding
let campainGoal = Web3.utils.toWei('25000', 'ether')
let deadline = 1000000

const Crowdfunding = await ethers.getContractFactory('Crowdfunding')
const crowdfunding = await upgrades.deployProxy(Crowdfunding, [challengeToken.address, campainGoal, deadline], {initializer: 'initialize'})


# Now, both contracts are deployed and ready to be used!

# Transfer funds to accounts
let amount = Web3.utils.toWei('100000', 'ether')

# Transfer to person1
let transaction = await challengeToken.connect(firstAccount).approve(person1.address, amount)
await transaction.wait()
await challengeToken.connect(firstAccount).transfer(person1.address, amount)

# Transfer to person2
transaction = await challengeToken.connect(firstAccount).approve(person2.address, amount)
await transaction.wait()
await challengeToken.connect(firstAccount).transfer(person2.address, amount)


# Now all three accounts have tokens!
let person1Balance = await challengeToken.balanceOf(person1.address)
Web3.utils.fromWei(person1Balance.toString(),'ether')


# Pledging

amount = Web3.utils.toWei('15000', 'ether')
transaction = await challengeToken.connect(person1).approve(crowdfunding.address, amount)
await transaction.wait()

await crowdfunding.connect(person1).pledge(amount)

# Check crowdfunding balance
let crowdfundongBalance = await crowdfunding.totalRaised()
let raised = Web3.utils.fromWei(crowdfundongBalance.toString(),'ether')

# Person2 also wants to contribute
amount = Web3.utils.toWei('10000', 'ether')
transaction = await challengeToken.connect(person2).approve(crowdfunding.address, amount)
await transaction.wait()

await crowdfunding.connect(person2).pledge(amount)

# Let's check crowdfunding balance again
crowdfundongBalance = await crowdfunding.totalRaised()

# Let' compare it to the goal of the crowdfunding
let campainRaiseGoal = await crowdfunding.goal()
campainRaiseGoal

# Time to cash out!!

# But first, let's see the balance of the owner of the campain
balance = await challengeToken.balanceOf(firstAccount.address)
let balanceStr = await balance.toString()
Web3.utils.fromWei(balanceStr,'ether')

# Time to cash out
await crowdfunding.connect(firstAccount).claim()

# See the balance now
let newBalance = await challengeToken.balanceOf(firstAccount.address)
let newBalanceStr = await balance.toString()
Web3.utils.fromWei(newBalanceStr,'ether')
```

### Notes

- You may need to increase the gas limit in the Hardhat config file (hardhat.config.js) if you encounter out-of-gas errors during migration or testing.
- Make sure to properly set the goal, deadline, and token parameters in the contract before deploying it.
- The ChallengeToken contract is included in this repository for convenience, but you can use any ERC-20 compatible token for this crowdfunding campaign.

#### Hardhat

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## How it works

The project consists of two contracts:

1. The first one is called _challengeToken.sol_
   - and this the smart contract for the actual token that uses the ERC20 standard.
2. The other one is the crowdfunding smart contract (called _Crowdfunding.sol_)
   - essencially it will govern the crowdfunding operations
   - such as pledging, claiming, cancelling

After compiling the project, it is possible to interact with them using `npx hardhat console`.
