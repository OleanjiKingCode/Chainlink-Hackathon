    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.4;

    interface IOleanjiDAOLinkToken {


        function IsAMember(address sender) external view returns(bool);
        function getInfo() external view returns (string memory);


        
    }