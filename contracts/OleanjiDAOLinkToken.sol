//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OleanjiDAOLinkToken is ERC20("OleanjiLinkToken" , "OLT"), Ownable{

    //address of the deployer
    address ownerAddress;

    //price to pay for membership into the dao can be later changed to matic so not cost alot of money
    uint256 priceforMembership = 0.025 ether;
   
    //every member that joins is given an award of 500 OLT tokens 
    uint256 public joinMembershipAward = 500 * 10 ** 18;


    //A struct to keep track of the data of the members 
    struct Members {
       uint256 memberId;
       string name;
       address memberAddress;
       uint256 balance;
      
    }
    //max number of members 
    uint256 public numberOfMembers;

    // a mappin to check if an address is a member of the dao or not
    mapping (address => bool ) public alreadyAMember;
    // counting of members
    mapping (uint => Members ) public memberCount;


    constructor(uint totalSupply)  {
       uint amount = totalSupply * 10 ** 18;
        ownerAddress = msg.sender;
        //minting tokens to give the deployer
       _mint(ownerAddress, amount);
    }


    // an external function to check membership of an address
    function IsAMember(address sender) external view returns(bool){
       bool isamember = alreadyAMember[sender];
       return isamember;
    }


    // to return the price for membership used in the client side
    function getPrice() public view returns(uint){
        return priceforMembership;
    }



    // this is to join the membership as they provide name in the client side
    //we also require that they are not a former member and what they sent is indeed the price for membership
    // the address balance of OLT tokens should be zero 
    function joinMembership(string memory _name) public payable {
        require(alreadyAMember[msg.sender] == false , "You are already a member");
        require (msg.value == priceforMembership, "Price is not Enough");
        require(balanceOf(msg.sender) == 0 , "Hmmm where did you get this token from?");

        // to mint more tokens for the deployer t dispense to members just joining incase it runs out
        uint256 Mintmore = 5000;
        if(balanceOf(ownerAddress) < Mintmore ){
            uint newMintingAmount = 10000 * 10 ** 18;
             _mint(ownerAddress, newMintingAmount);
        }

        // this is where the new members are given tokens and where they are removed from the deployer
         _mint(msg.sender, joinMembershipAward);
         _burn(ownerAddress, joinMembershipAward);
        alreadyAMember[msg.sender] = true;

        numberOfMembers += 1;

        // then update the struct even if the balance wont change again as it will be 500 forever i still put it there lol
        memberCount[numberOfMembers] = Members(
            numberOfMembers,
            _name,
            msg.sender,
            balanceOf(msg.sender)
        );
    }

    // this is to reterive the name of a an address from the struct 
    // could have used a mapping buh lol
        function getInfo(address sender) external view returns (string memory) {
            uint index = 0;
            string memory _name;
            for (index = 0; index < numberOfMembers; index++) {
               
                if(sender == memberCount[index + 1].memberAddress) {
                    uint currentId = memberCount[index + 1].memberId;
                    _name = memberCount[currentId].name;
                }
               
            }
            return _name ;
        }


    // here we fetch the mebers of the DAO
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
    
/*
    this function is for another contract to call in order to mint tokens for a certain winner
*/
    function _mintForWinners(address sender, uint amount) external {
        _mint(sender, amount);
    }

/*
    this function is to get how much the contract have
*/
    function getReserve() public view returns (uint) {
        return balanceOf(address(this));
    }


   function withdraw() public onlyOwner  {
            address _owner = owner();
            uint256 amount = address(this).balance;
            (bool sent, ) =  _owner.call{value: amount}("");
            require(sent, "Failed to send Ether");
    }



    receive() external payable {}

    fallback() external payable {}



}