    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.4;

    interface IOleanjiDAOLinkToken {

// An interface for the voting app to use to be able to check if an address ia a member or not
        function IsAMember(address sender) external view returns(bool);
        function getInfo() external view returns (string memory);
         function _mintForWinners(address sender, uint amount) external;

        
    }