//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OleanjiDAOLinkToken is ERC20("OleanjiLinkToken" , "OLT"), Ownable{

    address ownerAddress;
    uint256 priceforMembership = 0.025 ether;
   

    uint256 public joinMembershipAward = 500 * 10 ** 18;

    struct Members {
       uint256 memberId;
       string name;
       address memberAddress;
       uint256 balance;
      
    }

    uint256 numberOfMembers;

    mapping (address => bool ) public alreadyAMember;
    mapping (uint => Members ) memberCount;

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

   
    constructor(uint totalSupply)  {
       
       uint amount = totalSupply * 10 ** 18;
    
        ownerAddress = msg.sender;
       _mint(ownerAddress, amount);
    }

   
    




    function IsAMember() public view returns(bool){
       bool isamember = alreadyAMember[msg.sender];
       return isamember;
    }

    function getPrice() public view returns(uint){
        return priceforMembership;
    }


    function joinMembership(string memory _name) public payable {
        require(alreadyAMember[msg.sender] == false , "You are already a member");
        require (msg.value == priceforMembership, "Price is not Enough");
        require(balanceOf(msg.sender) == 0 , "Hmmm where did you get this token from?");
        uint256 Mintmore = 5000;
        if(balanceOf(ownerAddress) < Mintmore ){
            uint newMintingAmount = 10000 * 10 ** 18;
             _mint(ownerAddress, newMintingAmount);
        }
       
        
        
         _mint(msg.sender, joinMembershipAward);
         _burn(ownerAddress, joinMembershipAward);
        alreadyAMember[msg.sender] = true;

        numberOfMembers += 1;

        memberCount[numberOfMembers] = Members(
            numberOfMembers,
            _name,
            msg.sender,
            balanceOf(msg.sender)
        );
    }




      function fetchMembers() public view  onlyOwner returns(Members[] memory)  {
          Members[] memory members = new Members[] (numberOfMembers);
          uint256 index = 0;
          for(uint i = 0 ; i < numberOfMembers; i++) {
              uint current = memberCount[i + 1].memberId;
              Members storage currentMember = memberCount[current];

              members[index] = currentMember;
              index +=1;

          }
          return members;
    }
    


    function jointhecandidateList( string memory _slogan) public payable{
        require(!areYouACandidate[msg.sender], "You are already a candidate to be voted for");
        require(!votedAlready[msg.sender], "You have already voted for someone so you cannot be a candidate");
        // require(numofappliedCandidates < maxnumofAppliableCandidates, "the candidates spots are all full");
        require(msg.value >= votingPrice ,"Not Enough");
        transferFrom(msg.sender, address(this) , msg.value);
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
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    receive() external payable {}

    fallback() external payable {}



}