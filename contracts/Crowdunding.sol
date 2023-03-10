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
    bool private goalWasReached; // is the goal reached?
    bool private cancelledCampain; // was this campain cancelled

    /* Events for DApps to observe changes on state */
    // Changes in states
    event stateChanged(
        uint256 totalRaisedDApps,
        uint256 totalPledgesDApps,
        bool newUserToList,
        bool goalReached
    );

    event reachedGoal(bool totalGoalReached);
    event claimFunds(bool claimedFunds); // Claim funds
    event cancelCrowdfunding(bool returnTokensToPledgers); // Return funds to original ownersS
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
        cancelledCampain = false;
    }

    /* Pledge Function 
       - argument: amount
       - pledges: stores the amount funded by a certain address
       - msg.sender is the address put on pledges list
    */
    function pledge(uint256 _amount) public {
        bool newUser; // is a new pledger?

        require(_amount > 0, "Amount must be greater than 0");
        require(!cancelledCampain, "This campain was cancelled");
        require(
            block.timestamp <= initialBlockTime + deadline,
            "Campaign has already ended."
        );
        require(
            token.transferFrom(msg.sender, address(this), _amount),
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
        pledges[msg.sender] = pledges[msg.sender].add(_amount); // add amount to the funds already pledged by the user
        totalRaised = totalRaised.add(_amount); // updates the total amount raised
        if (totalRaised >= goal) {
            goalWasReached = true;
            emit reachedGoal(goalWasReached);
        }
        emit stateChanged(totalRaised, totalPledges, newUser, goalWasReached); // emit event for DApps
    }

    /* Withdraw Function
       - msg.sender can only claim up to the amount funded stored on pledges[msg.sender]
    */
    function withdraw(uint256 _amount) public {
        require(
            _amount <= pledges[msg.sender],
            "Amount must be lesser than or equal to the amount funded"
        );
        require(totalRaised < goal, "Goal has been reached"); // if the goal was reached, msg.sender can't have back the funds
        require(token.transfer(msg.sender, _amount), "Transfer failed"); //transfer funds
        pledges[msg.sender] = pledges[msg.sender].sub(_amount);
        totalRaised = totalRaised.sub(_amount);
        emit withdrawFunds(msg.sender, _amount);
    }

    /* Claim Function
       - once the goal has been reached, the owner can claim the funds in the contract
    */
    function claim() public {
        require(msg.sender == owner, "Only the owner can cancel the campaign"); // only the owner can call this function
        require(
            totalRaised >= goal || goalWasReached,
            "Goal has not yet been reached"
        ); // if the goal was reached, the owner can claim the funds transferred
        require(totalRaised > 0, "There are no pledged any funds available"); // amount must be positive
        require(token.transfer(msg.sender, totalRaised), "Transfer failed"); //transfer funds
        totalRaised = 0;
        goalWasReached = true;
        emit claimFunds(true);
    }

    /* Cancel Function 
       - refunds all users 
       - each one will be refunded the amount pledged
       - only the owner can call this function
       - the function can't be called if the goal has been reached
    */
    function cancel() public {
        require(msg.sender == owner, "Only the owner can cancel the campaign"); // only the owner can call this function
        require(
            totalRaised < goal && !goalWasReached,
            "Goal has already been reached"
        ); // asserts that the goal hasn't been reached
        // refund for all users
        for (uint256 i = 1; i < totalPledges + 1; i++) {
            uint256 amount = pledges[listOfUsers[i]]; // listOfUsers[i] is the address for a particular user
            require(token.transfer(listOfUsers[i], amount), "Transfer failed"); // transfer the funds
            pledges[listOfUsers[i]] = 0; // if the transfer is successfull, resets the amount funded by the particular address
        }
        cancelledCampain = true;
        emit cancelCrowdfunding(cancelledCampain);
    }
}
