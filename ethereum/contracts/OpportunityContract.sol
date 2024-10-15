//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.9;

import {CONTROL_MANAGEMENT} from "./MngContract.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

contract OpportunityContract is Ownable, ERC721Enumerable, ReentrancyGuard {
    constructor (
        string memory name,
        string memory symbol,
        uint256 _nominalAmount,
        uint256 _interestRatePerCent,
        uint256 _minimalTokenTranche,
        uint256 _numberOfTotalPayouts,
        uint256 _subscriptionPeriodDeadline,
        uint256 _interestRatePeriodAdjusted,
        address _nftManagementContractAddress
    ) ERC721(name, symbol) {
        nominalOpportunityAmount = _nominalAmount;
        interestRatePercent = _interestRatePerCent;
        minimalTokenTranche = _minimalTokenTranche;
        numberOfTotalPayouts = _numberOfTotalPayouts;
        subscriptionDeadline = block.timestamp + _subscriptionPeriodDeadline;
        interestRatePeriodAdjusted = _interestRatePeriodAdjusted;
        managementContractAddress = _nftManagementContractAddress;
        totalInvestmentAmount = 0;
    }

    address private managementContractAddress;
    uint256 private nominalOpportunityAmount;
    uint256 private totalInvestmentAmount;
    uint256 private subscriptionDeadline;

    uint256 private constant NUMBER_OF_WEI_PER_ETHER = 10 ** 18;

    using Counters for Counters.Counter;
    Counters.Counter public tokenIds;
    Counters.Counter public numberOfExecutedPayouts;

    uint256 public interestRatePercent;
    uint256 public interestRatePeriodAdjusted;
    uint256 public minimalTokenTranche;
    uint256 public numberOfTotalPayouts;

    mapping(uint => tokenRecord) internal metadataMap;

    struct tokenInfo {
        uint256 id;
        address owner;
        uint256 value;
        uint256 paidInterests;
        interestPayment[] paymentsList;
    }

    struct interestPayment {
        uint256 time;
        uint256 value;
    }

    struct tokenRecord {
        tokenInfo info;
        bool valid;
    }

    event InterestsPaid(address receiver, uint amount);
    event InvestmentAddedToInterests(address receiver, uint amount);
    event TransferOfTokenIsNotAllowed(address from, address to, uint256 tokenId);

    // The receive function marked as external and payable
    receive() external payable nonReentrant {
        CONTROL_MANAGEMENT managementContract = CONTROL_MANAGEMENT(managementContractAddress);
        try managementContract.IsInvestValid(msg.sender, address(this)) returns (bool) {

            //checking if the subscription is still valid
            if (block.timestamp >= subscriptionDeadline) {
                payable(msg.sender).transfer(msg.value);
                require(false, "the subscription period finished, you will get a refund in few minutes");
            }

            if (owner() != msg.sender) {
                ValidationHandler();

                uint256 currentValue = msg.value;
                uint256 freeInvestmentAmount = nominalOpportunityAmount - totalInvestmentAmount;
                // if investor send more then the free amount to invest
                if (currentValue > freeInvestmentAmount) {
                    uint256 paybackAmount = currentValue - freeInvestmentAmount;
                    currentValue = freeInvestmentAmount;
                    payable(msg.sender).transfer(paybackAmount);
                }

                tokenIds.increment();
                uint256 newTokenId = tokenIds.current();

                // Mint the NFT to the sender's address
                _safeMint(msg.sender, newTokenId);
                tokenRecord  storage newTokenRecord = metadataMap[newTokenId];
                newTokenRecord.info.id = newTokenId;
                newTokenRecord.info.owner = msg.sender;
                newTokenRecord.info.value = currentValue;
                newTokenRecord.info.paidInterests = 0;
                newTokenRecord.valid = true;

                totalInvestmentAmount += currentValue;
                managementContract.sendOpportunityMintedTokenEvent(address(this), msg.sender, currentValue, newTokenId);
            } else {
                managementContract.sendOpportunityReceivedFundsFromOwnerEvent(address(this), msg.sender, msg.value);
            }
        } catch Error(string memory reason)  {
            payable(msg.sender).transfer(msg.value);
            require(false, reason);
        }
    }

    function payInterestsToAllHolders() external onlyOwner nonReentrant {
        require(numberOfExecutedPayouts.current() < numberOfTotalPayouts, "all interest payments have been paid for this opportunity");
        CONTROL_MANAGEMENT managementContract = CONTROL_MANAGEMENT(managementContractAddress);
        uint256 currentPaymentTime = block.timestamp;
        numberOfExecutedPayouts.increment();

        uint256 totalTokens = tokenIds.current();

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (metadataMap[i].valid) {
                uint256 tokenOriginalValue = metadataMap[i].info.value;
                uint256 payoutPerTokenInWei = tokenOriginalValue * interestRatePeriodAdjusted / NUMBER_OF_WEI_PER_ETHER;

                metadataMap[i].info.paidInterests += payoutPerTokenInWei;

                // Transfer the payout to the token's owner

                if (numberOfExecutedPayouts.current() == numberOfTotalPayouts) {
                    payoutPerTokenInWei += tokenOriginalValue;
                    managementContract.lastInterestPaymentEvent(address(this), metadataMap[i].info.owner, payoutPerTokenInWei, metadataMap[i].info.id);
                } else {
                    managementContract.payInterestEvent(address(this), metadataMap[i].info.owner, payoutPerTokenInWei, metadataMap[i].info.id);
                }
                payable(metadataMap[i].info.owner).transfer(payoutPerTokenInWei);
                tokenRecord storage newTokenRecord = metadataMap[metadataMap[i].info.id];
                newTokenRecord.info.paymentsList.push(interestPayment({time: currentPaymentTime, value: payoutPerTokenInWei}));
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
        totalInvestmentAmount -= metadataMap[tokenId].info.value;
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

    function ValidationHandler() internal {
        if (totalInvestmentAmount >= nominalOpportunityAmount) {
            payable(msg.sender).transfer(msg.value);
            require(false, "the investment to this Opportunity is closed");
        } else if (numberOfExecutedPayouts.current() > numberOfTotalPayouts) {
            payable(msg.sender).transfer(msg.value);
            require(false, "the investment to this Opportunity is not valid anymore");
        } else if (msg.value < minimalTokenTranche) {
            payable(msg.sender).transfer(msg.value);
            require(false, "Not enough ETH sent");
        }
    }
}
