//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftContract is Ownable, ERC721Enumerable, ReentrancyGuard {
    constructor (
        string memory name,
        string memory symbol,
        uint256 _amount,
        uint256 _interestRatePerCent,
        uint256 _tokenPrice,
        uint256 _payoutInterval,
        uint256 _numberOfTotalPayouts
    ) ERC721(name, symbol) {
        amount = _amount;
        interestRatePerCent = _interestRatePerCent;
        tokenPrice = _tokenPrice;
        payoutInterval = _payoutInterval;
        nextPayoutTime = block.timestamp;
        numberOfTotalPayouts = _numberOfTotalPayouts;
    }

    using Counters for Counters.Counter;
    Counters.Counter public tokenIds;
    Counters.Counter public numberOfExecutedPayouts;
    uint256 public nextPayoutTime;
    uint256 public amount;
    uint256 public interestRatePerCent;
    uint256 public tokenPrice;
    uint256 public payoutInterval;
    uint256 public numberOfTotalPayouts;

    mapping(uint => tokenRecord) internal metadataMap;

    struct tokenInfo {
        uint256 id;
        address owner;
        uint256 value;
        uint256 paidInterests;
    }

    struct tokenRecord {
        tokenInfo info;
        bool valid;
    }

    event Received(address sender, uint amount);
    event MintedToken(address sender, uint amount);
    event InterestsPaid(address receiver, uint amount);
    event InvestmentAddedToInterests(address receiver, uint amount);
    event TransferOfTokenIsNotAllowed(address from, address to, uint256 tokenId);

    // The receive function marked as external and payable
    receive() external payable nonReentrant {
        emit Received(msg.sender, msg.value);

        if (owner() != msg.sender) {
            require(msg.value >= tokenPrice, "Not enough ETH sent");

            tokenIds.increment();
            uint256 newTokenId = tokenIds.current();

            // Mint the NFT to the sender's address
            _safeMint(msg.sender, newTokenId);
            metadataMap[newTokenId] = tokenRecord(
                tokenInfo(
                    newTokenId,
                    msg.sender,
                    msg.value,
                    0
                ),
                true
            );

            if (msg.value > tokenPrice) {
                payable(msg.sender).transfer(msg.value - tokenPrice);
            }

            emit MintedToken(msg.sender, msg.value);
        }
    }

    function payInterestsToAllHolders() external onlyOwner nonReentrant {
        require(block.timestamp >= nextPayoutTime);
        require(numberOfExecutedPayouts.current() < numberOfTotalPayouts);

        numberOfExecutedPayouts.increment();
        nextPayoutTime = block.timestamp + payoutInterval;

        uint256 totalTokens = tokenIds.current();
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (metadataMap[i].valid) {
                uint256 payout = ((metadataMap[i].info.value * interestRatePerCent) / 100) / numberOfTotalPayouts;
                metadataMap[i].info.paidInterests += payout;

                if (numberOfExecutedPayouts.current() == numberOfTotalPayouts) {
                    payout += tokenPrice;
                    emit InvestmentAddedToInterests(metadataMap[i].info.owner, payout);
                }

                // Transfer the payout  to the token's owner
                payable(metadataMap[i].info.owner).transfer(payout);
                emit InterestsPaid(metadataMap[i].info.owner, payout);
            }
        }
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        emit TransferOfTokenIsNotAllowed(from, to, tokenId);
    }

    function isValidToken(uint256 tokenId) internal view returns (bool) {
        return metadataMap[tokenId].valid;
    }

    function burn(uint256 tokenId) public virtual onlyOwner {
        super._burn(tokenId);
        metadataMap[tokenId].valid = false;
    }

    function getTokenMetaByPublicKey(address publicKey) public view returns (tokenInfo[] memory){
        uint amountToken = balanceOf(publicKey);
        uint nValid = 0;
        for (uint j = 0; j < amountToken; j++) {
            uint256 tokenId = tokenOfOwnerByIndex(publicKey, j);
            if (isValidToken(tokenId)) {
                nValid++;
            }
        }
        tokenInfo[] memory result = new tokenInfo[](nValid);
        uint i = 0;
        for (uint j = 0; j < amountToken; j++) {
            uint256 tokenId = tokenOfOwnerByIndex(publicKey, j);
            if (isValidToken(tokenId)) {
                tokenInfo memory token = getTokenMeta(tokenId);
                result[i++] = token;
            }
        }
        return (result);
    }

    function getTokenMeta(uint256 tokenId) public view returns (tokenInfo memory){
        require(isValidToken(tokenId), "ERC721: getTokenMeta - tokenId is not a valid token for this contract");
        tokenInfo memory token = metadataMap[tokenId].info;
        return token;
    }
}
