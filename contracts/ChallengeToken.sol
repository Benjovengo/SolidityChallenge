// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/** Imports **/
// Upgradeable modules
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ChallengeToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _totalSupply) public initializer {
        __ERC20_init("ChallengeToken", "CHAL");
        __Ownable_init();
        _mint(msg.sender, _totalSupply * 10**decimals());
    }
}
