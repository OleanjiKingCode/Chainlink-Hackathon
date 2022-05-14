//SPDX-License-Identifier:MIT


pragma solidity ^0.8.7;

import "./IOleanjiDAOLinkToken.sol";


 // This contract was forked/ used from one of my previous ones called DAOTOKEN
contract chatting  {

    
    IOleanjiDAOLinkToken oleanjidaotoken;

   // the cost of sending a group message
    uint256 public cost_Of_mesage = 1 ether;
    address owner;

     // All the info for one message/ transaction
    struct Transaction {
        uint256 transactId;
        address sender;
        string Name;
        address to;
        uint256 value;
        string time;    
        string message;
        bytes32 hashText;
    }
    mapping(uint256 => Transaction ) private idTransaction;
  
    uint256 numofTransaction;



    constructor(address _tokenaddress)  {
      
        oleanjidaotoken = IOleanjiDAOLinkToken(_tokenaddress);
        owner = msg.sender;
      
    }

/*
    This function is used to create the transaction, including the payment which is done in client.
 */

    function CreateTransactionList (
        string memory _message,
        string memory _time ,
        bytes32  _hash) 
        public {

        address _sender = msg.sender;
        bytes memory b1 = bytes(_time);
        require(b1.length != 0 , "it is empty");
        require(_hash != "", "it is empty");
        string memory cuurentName = oleanjidaotoken.getInfo(_sender);
        numofTransaction +=1;
        idTransaction[numofTransaction] = Transaction (
            numofTransaction,
            _sender,
            cuurentName,
            address(this),
            cost_Of_mesage,
            _time,
            _message,
            _hash
        );
    }


/* 
    To Fetch all the transactions done in the above.
*/

    function FetchAllTransactions() public view returns (Transaction [] memory){
        Transaction [] memory transaction = new Transaction [] (numofTransaction);
        uint index = 0;
        for (uint i = 0; i < numofTransaction; i++) {
            uint currentPoint = idTransaction[i+1].transactId;
            Transaction storage currentTransact = idTransaction[currentPoint];
            transaction[index] = currentTransact;
            index +=1;
        }
        return transaction;

    }

       
}