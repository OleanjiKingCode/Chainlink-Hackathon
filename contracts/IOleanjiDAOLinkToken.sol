    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.4;

    interface IOleanjiDAOLinkToken {

    // An interface for the voting app to use to be able to check if an address ia a member or not
        function IsAMember(address sender) external view returns(bool);
    // This function is used to get the name about a certain address 
        function getInfo(address sender) external view returns (string memory);
    // This is a function that is called by the voting contract in order to mint new tokens for new winners
        function _mintForWinners(address sender, uint amount) external;
    }