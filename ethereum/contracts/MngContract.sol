// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract CONTROL_MANAGEMENT is AccessControlUpgradeable
{
    bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");
    bytes32 public constant ACTIVE = keccak256("ACTIVE");

    struct NftInvestor {
        bytes32 status;
        bool isRegistered;
    }

    mapping(address => NftInvestor) private _investors;
    address[] private _investorAddressList;


    struct NftContract {
        bytes32 nftID;
        mapping(address => bool) _investors;
        bytes32 status;
        address owner;
        bool isRegistered;
    }

    mapping(address => NftContract) private _nftContracts;
    address[] private _nftContractAddressList;

    function initialize() public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(INVESTOR_ROLE, _msgSender());
    }

    function IsInvestValid(address investor, address nftContract) public view returns (bool){
        require(nftContract != address(0), "Opportunity adress is invalid");
        require(_nftContracts[nftContract].isRegistered, "Opportunity is unregistered");
        require(_nftContracts[nftContract].status == ACTIVE, "Opportunity is not active");
        require(_nftContracts[nftContract]._investors[investor] || investor == _nftContracts[nftContract].owner, "user is not an investor or owner of the current NFT");
        return true;
    }

    function registerNewOpportunity(bytes32 nftID, address contractAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(contractAddress != address(0), "Invalid Opportunity address.");
        require(!_nftContracts[contractAddress].isRegistered, "Opportunity already registered.");
        _nftContracts[contractAddress].isRegistered = true;
        _nftContracts[contractAddress].nftID = nftID;
        _nftContracts[contractAddress].status = ACTIVE;
        _nftContracts[contractAddress].owner = msg.sender;
        _nftContractAddressList.push(contractAddress);
        emit ContractRegistered(nftID, contractAddress);
    }

    function registerNewInvestor(address investorAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(investorAddress != address(0), "Invalid investor address.");
        require(!_investors[investorAddress].isRegistered, "Investor already registered.");

        _investors[investorAddress].isRegistered = true;
        _investors[investorAddress].status = ACTIVE;
        _investorAddressList.push(investorAddress);

        emit NewInvestorRegistered(investorAddress);
    }

    function registerInvestorToOpportunity(address investorAddress, address contractAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(investorAddress != address(0), "Invalid investor address.");
        require(_investors[investorAddress].isRegistered == true, "Investor does not exist.");
        require(_investors[investorAddress].status == ACTIVE, "Investor does not active.");
        require(contractAddress != address(0), "Invalid Opportunity address.");
        require(_nftContracts[contractAddress].isRegistered, "Opportunity does not exist.");
        _nftContracts[contractAddress]._investors[investorAddress] = true;
        emit InvestorRegisteredToNft(investorAddress, contractAddress);
    }

    function getRegisteredInvestors() public onlyRole(DEFAULT_ADMIN_ROLE) view virtual returns (address[] memory) {
        return _investorAddressList;
    }

    function getInvestorStatus(address investorAddress) public view returns (bool, bytes32) {
        require(investorAddress != address(0), "Invalid investor address.");
        require(_investors[investorAddress].isRegistered, "Investor not registered.");

        return (_investors[investorAddress].isRegistered, _investors[investorAddress].status);
    }

    function getInvestorStatusInOpportunity(address investorAddress, address contractAddress) public view returns (address, bool) {
        require(investorAddress != address(0), "Invalid investor address.");
        require(_investors[investorAddress].isRegistered == true, "Investor does not exist.");
        require(_investors[investorAddress].status == ACTIVE, "Investor does not active.");
        require(contractAddress != address(0), "Invalid Opportunity address.");
        require(_nftContracts[contractAddress].isRegistered, "Opportunity does not exist.");

        return (investorAddress, _nftContracts[contractAddress]._investors[investorAddress]);
    }

    //  ##################
    //  opportunity Events
    //  ##################

    function sendOpportunityReceivedFundsFromOwnerEvent(address opportunityAddress, address sender, uint amount) external {
        emit ReceivedFundsFromOwner(opportunityAddress, sender, amount);
    }


    function sendOpportunityMintedTokenEvent(address opportunityAddress, address sender, uint amount, uint tokenId) external {
        emit MintedToken(opportunityAddress, sender, amount, tokenId);
    }


    function lastInterestPaymentEvent(address opportunityAddress, address sender, uint payout, uint tokenId) external {
        emit LastInterestsPaid(opportunityAddress, sender, payout, tokenId);
    }

    function payInterestEvent(address opportunityAddress, address sender, uint payout, uint tokenId) external {
        emit InterestsPaid(opportunityAddress, sender, payout, tokenId);
    }

    event ContractRegistered(bytes32 nftID, address contractAddress);
    event NewInvestorRegistered(address contractAddress);
    event InvestorRegisteredToNft(address investorAddress, address contractAddress);

    event ReceivedFundsFromOwner(address opportunityAddress, address sender, uint amount);
    event MintedToken(address opportunityAddress, address sender, uint amount, uint tokenId);
    event InterestsPaid(address opportunityAddress, address sender, uint payout, uint tokenId);
    event LastInterestsPaid(address opportunityAddress, address sender, uint payout, uint tokenId);
    event InvestmentAddedToInterests(address receiver, uint amount);
    event TransferOfTokenIsNotAllowed(address from, address to, uint256 tokenId);

}