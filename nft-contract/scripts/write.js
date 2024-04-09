// This is a helper script for writing (changing state) into deployed contract

const { ethers } = require("hardhat");
// The address of the deployed contract
const contractAddress = process.env["CONTRACT_ADDRESS"]
const contractOwnerPrivateKey = process.env["ACCOUNT_PRIVATE_KEY"]

async function main() {
    // The contract's compiled artifacts are in the 'artifacts' directory.
    const contractArtifact = require("../artifacts/contracts/NftContract.sol/NftContract.json");

    // Initialize contract using ABI and address
    const myContract = new ethers.Contract(contractAddress, contractArtifact.abi, ethers.provider);

    const signer = new ethers.Wallet(contractOwnerPrivateKey, ethers.provider);
    const myContractWithSigner = myContract.connect(signer);

    // Example: Burn
    // const burned = await myContractWithSigner.burn(1);
    // console.log("Value:", value.toString());

    // Example: Pay interests
    const paid = await myContractWithSigner.payInterestsToAllHolders();
    console.log("Value:", paid.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });