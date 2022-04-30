//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;


import "./IOleanjiDAOLinkToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract VotingDappByOleanji {

  // making instances of the token and its interface there may be another way but this is what i did 
  // without help :D
    ERC20 linktoken;
    IOleanjiDAOLinkToken oleanjidaotoken;
    constructor(address _tokenAddress){
        linktoken =ERC20(_tokenAddress);
        oleanjidaotoken = IOleanjiDAOLinkToken(_tokenAddress);
    }
    
    uint votingPrice= 150;
    uint8 public numofappliedCandidates;

    uint8 public maxnumofAppliableCandidates = 5;
    // to check if a candidate or not
    mapping(address => bool) public areYouACandidate;
// a struct to kepp track of the id and other information about the candidate
    struct Voters{
        uint votersId;
        string Name;
        address candidateAddress;
        string Slogan;
        
    }
//mapping to get individual candidate or voters i mix up the english here
    mapping(uint256 => Voters) private Votersprofile;
    //to get the voting price
    function getVotingPrice() public view returns(uint){
        return votingPrice;
    }
  
//check if voted already
    mapping(address => bool) public votedAlready;

// to join the people who would be randomly selected to get 500 OLT tokens
    function jointhecandidateList( string memory _slogan ,uint _amount) public payable  {
        
        require(!areYouACandidate[msg.sender], "You are already a candidate to be voted for");
        require(oleanjidaotoken.IsAMember(msg.sender) == true , "You are  a false member" );
        require(numofappliedCandidates < maxnumofAppliableCandidates, "the candidates spots are all full");
       
        string memory name = oleanjidaotoken.getInfo();

        numofappliedCandidates +=1;
        Votersprofile[numofappliedCandidates] =Voters(
            numofappliedCandidates,
            name,
            msg.sender,
            _slogan
        );
        areYouACandidate[msg.sender]=true;
        linktoken.transferFrom(msg.sender, address(this) ,_amount);
        
        
    }


   

    function fetchVotersList () public view returns(Voters[] memory) {
        Voters[] memory list = new Voters[] (numofappliedCandidates);
        uint index = 0;
        for (uint i = 0; i < numofappliedCandidates; i++){
            uint currentnum = Votersprofile[i + 1].votersId;
            Voters storage currentItem = Votersprofile[currentnum];
            
            list[index] = currentItem;
            index += 1;
        }

        return list;
    }
  
   
}
