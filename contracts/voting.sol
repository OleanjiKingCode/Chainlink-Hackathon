//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;


import "./IOleanjiDAOLinkToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "hardhat/console.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";

error UpkeepNotNeeded();

/*this contract has a lot of name "Vote" even if it is not a voting contract i changed it from a voting contract 
    to one dat ppl dont need to vote for a winner im using chainlink now
*/
contract VotingDappByOleanji is VRFConsumerBaseV2,Ownable {

    
     using Counters for Counters.Counter;
    // making instances of the token and its interface there may be another way but this is what i did 
    // without help :D
    uint public immutable interval;
    uint public lastTimeStamp;
    ERC20 linktoken;
    IOleanjiDAOLinkToken oleanjidaotoken;

// the amount of OLT tokens deducted from a person's account that is tryna vote
    uint votingPrice= 150;
    Counters.Counter public numofappliedCandidates;
    
   
   
    // to check if a candidate or not
    mapping(address => bool) public areYouACandidate;

    // a struct to kepp track of the id and other information about the candidate
    struct Voters{
        uint votersId;
        address candidateAddress;
        string Slogan;
        string name;
    }

    //mapping to get individual candidate or voters i mix up the english here
    mapping(uint256 => Voters) private Votersprofile;

    bool public applicationStarted=true;
     bool public applicationCalculating=false;
   

    uint winnersTokens = 250 * 10 ** 18;


    
/*
        Information needed by Chainlink VRF to work
*/

  VRFCoordinatorV2Interface COORDINATOR;


  uint64 s_subscriptionId;


  address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;


  bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

  uint32 callbackGasLimit = 300000;

 
  uint16 requestConfirmations = 3;

  uint32 numWords =  1;

  uint256 public s_randomLuck;
  address public winner;
  uint256 public s_requestId;
  address s_owner;
  


    constructor(
    address _tokenAddress,
    uint updateInterval,
    uint64 subscriptionId) 
    VRFConsumerBaseV2(vrfCoordinator)
    {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
        linktoken =ERC20(_tokenAddress);
        oleanjidaotoken = IOleanjiDAOLinkToken(_tokenAddress);
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }


/*
    This function is used to reset after the loop has finished like to start afresh
*/
    
    function ResetApplication() public {
        applicationStarted=true;
        applicationCalculating=false;
        lastTimeStamp = block.timestamp;
        uint256 index = 0;
         uint256 Number = numofappliedCandidates.current();
        for (index= 0; index < Number; index++) { 

            address memAddr = Votersprofile[index+1].candidateAddress;

            areYouACandidate[memAddr]=false;

             delete Votersprofile[index+1];
           
       }
        numofappliedCandidates.reset();

    }

/*
    This function is used to credit the winner that chainlink choses by using
    the number gotten and get it address by going through all the profiles and using the mint function imported
*/
   function CreditWinner(uint id) public  {
       require(!applicationStarted && applicationCalculating, "The application has not even started");
       uint256 index = 0;
       uint256 currentNumber = numofappliedCandidates.current();
       for (index= 0; index < currentNumber; index++) {
           if(id == Votersprofile[index + 1].votersId){
               winner = Votersprofile[id].candidateAddress;

              oleanjidaotoken._mintForWinners(winner, winnersTokens);
               areYouACandidate[winner]=false;
           }
       }
   }
 
 /*
    This function is used to get the number of candidates that have applied to get new tokens
  */

     function getNumberOfCandidates () external view returns(uint) {
       return numofappliedCandidates.current();
    }


    //to get the voting price
    function getVotingPrice() public view returns(uint){
        return votingPrice;
    }

    /* 
        This function is used to know if an address is a candidate or not.
    */

     function IsACandidate(address sender) external view returns(bool){
       bool isACandidate = areYouACandidate[sender];
       return isACandidate;
    }


    // to join the people who would be randomly selected to get 500 OLT tokens
    function jointhecandidateList( string memory _slogan ,uint _amount) public payable  {
        require(applicationStarted && !applicationCalculating, "Application has not started");
        require(!areYouACandidate[msg.sender], "You are already a candidate to be voted for");
        require(oleanjidaotoken.IsAMember(msg.sender) == true , "You are  a false member" );

    
        numofappliedCandidates.increment();
            uint256 current =  numofappliedCandidates.current();
        string memory nameofCurrent =  oleanjidaotoken.getInfo(msg.sender);
        Votersprofile[current] =Voters(
            current,
            msg.sender,
            _slogan,
            nameofCurrent
        );
        areYouACandidate[msg.sender]=true;
        linktoken.transferFrom(msg.sender, address(this) ,_amount);

    }

/*
    This is used to get the list of people who entered
 */
    function fetchVotersList () public view returns(Voters[] memory) {
         uint256 current =  numofappliedCandidates.current();
        Voters[] memory list = new Voters[] (current);
        uint index = 0;
        uint256 currentNumber = numofappliedCandidates.current();
        for (uint i = 0; i < currentNumber; i++){
            uint currentnum = Votersprofile[i + 1].votersId;
            Voters storage currentItem = Votersprofile[currentnum];
            list[index] = currentItem;
            index += 1;
        }

        return list;
    }
  

    
    function checkUpkeep(
        bytes memory /* checkData */
        )public
         view  
        returns (bool upkeepNeeded, bytes memory /* performData */) {

        bool isOpen = applicationStarted;
        bool itsTime = ((block.timestamp - lastTimeStamp) > interval);
        bool enoughPeople = (numofappliedCandidates.current() >= 1);
        upkeepNeeded = (isOpen && itsTime && enoughPeople);
        return (upkeepNeeded, "0x0");
      
    }



    function performUpkeep(bytes calldata /* performData */) external {

       (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded) {
            revert UpkeepNotNeeded();
        }
        s_requestId = COORDINATOR.requestRandomWords(
        keyHash,
        s_subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        numWords
        );
    }


    function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords)
     internal override {

    uint256 currentNumber = numofappliedCandidates.current();
    s_randomLuck = (randomWords[0] % currentNumber) + 1;
    applicationStarted = false;
    applicationCalculating =true;
    CreditWinner(s_randomLuck);
    ResetApplication();
  }



    function withdraw() public onlyOwner  {
            address _owner = owner();
            uint256 amount = address(this).balance;
            (bool sent, ) =  _owner.call{value: amount}("");
            require(sent, "Failed to send Ether");
    }

   
}
