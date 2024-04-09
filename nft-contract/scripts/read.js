// This is a helper script for reading values from deployed contract

const { ethers } = require("hardhat");
// The address of the deployed contract
const contractAddress = process.env["CONTRACT_ADDRESS"]

async function main() {
    // The contract's compiled artifacts are in the 'artifacts' directory.
    const contractArtifact = require("../artifacts/contracts/NftContract.sol/NftContract.json");

    // Initialize contract using ABI and address
    const myContract = new ethers.Contract(contractAddress, contractArtifact.abi, ethers.provider);

    // Example: Read from the contract
    const value = await myContract.getTokenMeta(1);
    console.log("Value:", value.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });