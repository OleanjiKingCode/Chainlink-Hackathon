//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VotingDappByOleanji {


    address tokenAddress;

    constructor(address _tokenAddress){
        tokenAddress = _tokenAddress;
    }
    
    uint votingPrice= 150 *10 ** 18;
    uint8 public numofappliedCandidates;

    // uint8 public maxnumofAppliableCandidates = 5;
    
    mapping(address => bool) public areYouACandidate;

    struct Voters{
        uint votersId;
        uint votecount;
        string Slogan;
        
    }

    mapping(uint256 => Voters) private Votersprofile;

    mapping(address => bool) public votedAlready;


    function jointhecandidateList( string memory _slogan) public payable{
        require(!areYouACandidate[msg.sender], "You are already a candidate to be voted for");
        require(!votedAlready[msg.sender], "You have already voted for someone so you cannot be a candidate");
        // require(numofappliedCandidates < maxnumofAppliableCandidates, "the candidates spots are all full");
        require(msg.value >= votingPrice ,"Not Enough");
       
        numofappliedCandidates +=1;

        Votersprofile[numofappliedCandidates] =Voters(
            numofappliedCandidates,
            0,
            _slogan
        );
        areYouACandidate[msg.sender]=true;
        votedAlready[msg.sender]=false;
    }


    function Voting (uint8 _votersId) public {
        require(!areYouACandidate[msg.sender], "You are already a candidate to be voted for");
        require(!votedAlready[msg.sender], "You have already voted for someone so you cannot be a candidate");
        Votersprofile[_votersId].votecount += 1;
        votedAlready[msg.sender]=true;
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
