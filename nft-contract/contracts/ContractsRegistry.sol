// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractsRegistry is Ownable {
    mapping(string => address) private registry;
    string[] private contractNames;

    event ContractRegistered(string indexed name, address indexed contractAddress);

    function registerContract(string memory name, address contractAddress) public onlyOwner {
        require(registry[name] == address(0), "Contract already registered.");
        require(contractAddress != address(0), "Invalid contract address.");

        registry[name] = contractAddress;
        contractNames.push(name);
        emit ContractRegistered(name, contractAddress);
    }

    function getContract(string memory name) public view returns (address) {
        require(registry[name] != address(0), "Contract not registered.");
        return registry[name];
    }

    function getAllContracts() public view returns (string[] memory names, address[] memory addresses) {
        names = new string[](contractNames.length);
        addresses = new address[](contractNames.length);

        for (uint i = 0; i < contractNames.length; i++) {
            names[i] = contractNames[i];
            addresses[i] = registry[contractNames[i]];
        }

        return (names, addresses);
    }
}
