// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/* Custom Token
  - name: the name of your token
  - symbol: the symbol of your token
  - decimals: the number of decimal points your token supports
  - totalSupply: the total number of tokens that will be minted
 */

// Import OpenZeppelin Modules
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Imports for security checked functions
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ChallengeToken is ERC20 {
    // using functions with security checks
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Initialize with the total supply for the token
    constructor(uint256 initialSupply) ERC20("Challenge", "CHL") {
        _mint(msg.sender, initialSupply * (10**decimals())); // multiply the total supply by 10^18
    }
}
