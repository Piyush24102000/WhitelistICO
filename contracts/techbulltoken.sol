// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./ICryptoDevs.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract techbulltoken is ERC20, Ownable {
    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokensPerNft = 10 * 10**18;
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    //Instance
    ICryptoDevs TechBull;
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _TechBullContract) ERC20("TechBull Token", "TB") {
        TechBull = ICryptoDevs(_TechBullContract);
    }

    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        uint256 amountWithDecimals = amount * 10**18;
        require(
            msg.value >= _requiredAmount,
            "Please send correct number of ethers"
        );
        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceeds the max total supply available."
        );
        _mint(msg.sender, amountWithDecimals);
    }

    function claim() public {
        address sender = msg.sender;
        uint256 balance = TechBull.balanceOf(sender);
        require(balance > 0, "You dont own any NFTS");
        uint256 amount = 0;
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = TechBull.tokenOfOwnerByIndex(sender, i);
            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed all the tokens");
        _mint(msg.sender, amount * tokensPerNft);
    }
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
      }

      // Function to receive Ether. msg.data must be empty
      receive() external payable {}

      // Fallback function is called when msg.data is not empty
      fallback() external payable {}
  }

