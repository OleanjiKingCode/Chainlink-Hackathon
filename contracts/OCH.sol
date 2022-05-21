 // SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IOleanjiDAOLinkToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OCH is ERC721Enumerable, Ownable {
    using Strings for uint256;
    
       
    uint256 public NftPrice = 200;

       
    uint256 public tokenIds;
    string _baseTokenURI;
    uint256 public Maximum = 12;
    ERC20 linktoken;
    IOleanjiDAOLinkToken oleanjidaotoken;
    
    mapping(address => bool) public alreadyMinted;

        

    constructor (string memory baseURI,address _tokenAddress) ERC721("Oleanji ChainLink Hackathon", "OCH") {
        _baseTokenURI = baseURI;
        linktoken =ERC20(_tokenAddress);
        oleanjidaotoken = IOleanjiDAOLinkToken(_tokenAddress);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    function Mint(uint _amount) public payable  {
        require(!alreadyMinted[msg.sender] , "You already minted before");
        require(oleanjidaotoken.IsAMember(msg.sender) == true , "You are  a false member" );
        require(tokenIds < Maximum, "Sorry bro its has finish");
        tokenIds += 1;
        linktoken.transferFrom(msg.sender, address(this) ,_amount);
        _safeMint(msg.sender, tokenIds);
        alreadyMinted[msg.sender] = true;
    }
    

      function AlreadyMintedAnNFT(address sender) external view returns(bool){
       bool minted = alreadyMinted[sender];
       return minted;
    }
       
    

     function getMintingPrice() public view returns(uint){
        return NftPrice;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Not Exist");

        string memory baseURI = _baseURI();
        
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
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