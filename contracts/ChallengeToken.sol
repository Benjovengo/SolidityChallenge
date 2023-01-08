// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Import OpenZeppelin Modules
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Imports for security checked functions
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ChallengeToken is ERC20, Ownable {
    // using functions with security checks
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Initialize with the total supply for the token
    constructor(uint256 totalTokens) ERC20("Challenge", "CHAL") {
        _mint(msg.sender, totalTokens * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
