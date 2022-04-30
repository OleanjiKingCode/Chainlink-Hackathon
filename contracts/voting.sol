//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;


import "./OleanjiDAOLinkToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract VotingDappByOleanji {

  
    ERC20 linktoken;

    constructor(address _tokenAddress){
        linktoken =ERC20(_tokenAddress) ;
    }
    
    uint votingPrice= 150;
    uint8 public numofappliedCandidates;

    uint8 public maxnumofAppliableCandidates = 5;
    
    mapping(address => bool) public areYouACandidate;

    struct Voters{
        uint votersId;
        
        string Slogan;
        
    }

    mapping(uint256 => Voters) private Votersprofile;
    function getVotingPrice() public view returns(uint){
        return votingPrice;
    }
  

    mapping(address => bool) public votedAlready;


    function jointhecandidateList( string memory _slogan ,uint _amount) public payable {
        require(!areYouACandidate[msg.sender], "You are already a candidate to be voted for");
       
        require(numofappliedCandidates < maxnumofAppliableCandidates, "the candidates spots are all full");
       
       
        numofappliedCandidates +=1;
        Votersprofile[numofappliedCandidates] =Voters(
            numofappliedCandidates,
            
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
