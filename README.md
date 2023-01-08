# ERC-20 Crowdfunding Challenge

This is a smart contract for a crowdfunding campaign that uses a custom ERC-20 token called _ChallengeToken_. It allows backers to contribute to the campaign and receive ChallengeTokens in return. The campaign has a goal and a deadline, and if the goal is not reached by the deadline, the funds will be returned to the backers.

## Introduction

The project consists of two contracts:

1. The first one is called challengeToken.sol
   - and this the smart contract for the actual token that uses the ERC20 standard.
2. The other one is the crowdfunding smart contract (called Crowdfunding.sol)
   - essencially it will govern the crowdfunding operations
   - such as pledging, claiming, cancelling

### Prerequisites

- Node.js and npm: https://nodejs.org/
- Hardhat: https://hardhat.org/

### Install

1. Clone this repository: `git clone https://github.com/Benjovengo/SolidityChallenge.git`
2. Install the dependencies: `npm install`

### Deploy

1. Start a local Ethereum network with Hardhat: `npx hardhat node`
2. Compile the contracts: `npx hardhat compile`
3. Migrate the contracts to the local network: `npx hardhat migrate`

### Test

1. Start a local Ethereum network with Hardhat: `npx hardhat node`
2. Run the tests: `npx hardhat test`

### Use

1. Start a local Ethereum network with Hardhat: `npx hardhat node`
2. Use the deployed contract by interacting with it through a _web3 interface_, such as the Hardhat console: `npx hardhat console`

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
