// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Import Modules
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Crowdfunding {
    // Safe definitions - OpenZeppelin
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Variables - declarations
    IERC20 private token; // Custom ERC20 token for this campaign
    address private owner; // Owner of the contract
    uint256 public goal; // Goal for the campaign
    uint256 public totalRaised; // Total amount raised so far
    mapping(address => uint256) public pledges; // Pledges from each user
    uint256 public totalPledges; // Total number of different user accounts
    mapping(uint256 => address) public listOfUsers; // List of all users (used to pay back in case of cancelling of contract)
    bool private newUser = false;

    // Events for DApps to observe changes on state
    event StateChanged(
        uint256 totalRaisedDApps,
        uint256 totalPledgesDApps,
        bool newUserToList
    );

    constructor(IERC20 _token, uint256 _goal) {
        require(_goal > 0, "Goal must be greater than 0");
        token = _token;
        owner = msg.sender;
        goal = _goal; // goal amount for the campain
    }

    /* Pledge Function 
       - argument: amount
       - pledges: stores the amount funded by a certain address
       - msg.sender is the address put on pledges list
    */
    function pledge(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        // checks if sender has already pledged before or not
        if (pledges[msg.sender] == 0) {
            totalPledges++; // updates total number of users that pledged
            listOfUsers[totalPledges] = msg.sender; // add new user to the list of pledged users
            newUser = true;
        } else {
            newUser = false;
        }
        pledges[msg.sender] = pledges[msg.sender].add(amount); // add amount to the funds already pledged by the user
        totalRaised = totalRaised.add(amount); // updates the total amount raised
        emit StateChanged(totalRaised, totalPledges, newUser); // emit event for DApps
    }

    /* Claim Function 
       - doesn't need any argument
       - msg.sender can only claim the amount funded from msg.sender address
    */
    function claim() public {
        require(totalRaised >= goal, "Goal has not yet been reached"); // if the goal was reached, msg.sender can't claim the funds transferred
        uint256 amount = pledges[msg.sender]; // gets the amount funded by msg.sender
        require(amount > 0, "You have not pledged any funds"); // amount must be positive
        require(token.transfer(msg.sender, amount), "Transfer failed"); //transfer funds
        pledges[msg.sender] = 0; // resets the amount sent by msg.sender
    }

    /* Cancell Function 
       - reverts the funds for all users 
       - each one will only receive the amount funded by themselves
       - only the owner can call this function
       - the function can't be called if the goal has been reached
    */
    function cancel() public {
        require(msg.sender == owner, "Only the owner can cancel the campaign"); // only the owner can call this function
        require(totalRaised < goal, "Goal has already been reached"); // asserts that the goal hasn't been reached
        // for all users, transfer back their funds
        for (uint256 i = 1; i < totalPledges + 1; i++) {
            uint256 amount = pledges[listOfUsers[i]]; // listOfUsers[i] is the address for a particular user
            require(token.transfer(listOfUsers[i], amount), "Transfer failed"); // transfer the funds
            pledges[listOfUsers[i]] = 0; // if the transfer is successfull, resets the amount funded by the particular address
        }
    }
}
