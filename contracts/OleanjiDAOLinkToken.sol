//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OleanjiDAOLinkToken is ERC20("OleanjiLinkToken" , "OLT"), Ownable{

    address ownerAddress;
   
    constructor(uint totalSupply)  {
       
       uint amount = totalSupply * 10 ** 18;
  
        ownerAddress = msg.sender;
       _mint(ownerAddress, amount);
    }
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

    
    function IsAMember() public view returns(bool){
       bool isamember = alreadyAMember[msg.sender];
       return isamember;
    }
    function joinMembership(string memory _name) public {
        require(alreadyAMember[msg.sender] == false , "You are already a member");

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
    




}