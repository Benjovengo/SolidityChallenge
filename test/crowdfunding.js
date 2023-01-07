const { expect } = require('chai');
const { ethers } = require('hardhat');


describe('Deployment', () => {

  let challengeToken
  beforeEach(async () => {
    // Deploy Token - with an total supply of 1,000,000 tokens
    const ChallengeToken = await ethers.getContractFactory('ChallengeToken')
    challengeToken = await ChallengeToken.deploy(1000000)
  })

  describe('Deployment', () => {
    it('Challenge Token total supply', async () => {
        let result = await challengeToken.totalSupply()
        result = result/(10**18)
        expect(await result).to.equal(1000000)
    })
  })

})