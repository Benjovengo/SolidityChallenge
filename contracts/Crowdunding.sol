// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/** Imports **/
// Safe modules
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// Upgradeable modules
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract Crowdfunding {
    // Safe definitions - OpenZeppelin
    using SafeMath for uint256;

    // Variables - declarations
    IERC20Upgradeable private token; // Custom ERC20 token for this campaign
    address private owner; // Owner of the contract
    uint256 public goal; // Goal for the campaign
    uint256 public deadline; // Deadline for the campain
    uint256 private initialBlockTime; // Start of the campain
    uint256 public totalRaised; // Total amount raised so far
    mapping(address => uint256) public pledges; // Pledges from each user
    uint256 public totalPledges; // Total number of different user accounts
    mapping(uint256 => address) public listOfUsers; // List of all users (used to pay back in case of cancelling of contract)
    bool private newUser = false;
    bool private goalWasReached = false;

    /* Events for DApps to observe changes on state */
    // Changes in states
    event stateChanged(
        uint256 _totalRaisedDApps,
        uint256 _totalPledgesDApps,
        bool _newUserToList,
        bool _goalReached
    );

    event goalReached(bool _hasReached); // Goal reached
    event claimFunds(bool _claimedFunds); // Claim funds
    event cancelCrowdfunding(bool _returnTokensToPledgers); // Return funds to original ownersS
    event withdrawFunds(address whoPledged, uint256 amount); // withdraw funds

    function initialize(
        IERC20Upgradeable _token,
        uint256 _goal,
        uint256 _deadline
    ) public {
        token = _token;
        owner = msg.sender;
        goal = _goal;
        deadline = _deadline;
        initialBlockTime = block.timestamp;
    }
}
