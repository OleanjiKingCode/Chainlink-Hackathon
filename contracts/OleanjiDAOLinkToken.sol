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

    uint256 public numberOfMembers;

    mapping (address => bool ) public alreadyAMember;
    mapping (uint => Members ) public memberCount;

  

   

   
    constructor(uint totalSupply)  {
       
       uint amount = totalSupply * 10 ** 18;
    
        ownerAddress = msg.sender;
       _mint(ownerAddress, amount);
    }

   
    




    function IsAMember(address sender) external view returns(bool){
       bool isamember = alreadyAMember[sender];
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


        function getInfo() external view returns (string memory, address) {
            uint index = 0;
            string memory _name;
            for (index = 0; index < numberOfMembers; index++) {
                address sender = msg.sender;
                if(sender == memberCount[index + 1].memberAddress) {
                    uint currentId = memberCount[index + 1].memberId;
                    _name = memberCount[currentId].name;
                }
               
            }
            return (_name ,msg.sender);
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
    


    function getReserve() public view returns (uint) {
        return balanceOf(address(this));
    }
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    receive() external payable {}

    fallback() external payable {}



}