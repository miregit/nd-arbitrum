const contractName = "ContractsRegistry"
const contractClass = "ContractsRegistry"

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const contractsRegistryContract = await ethers.getContractFactory(contractClass);

    console.log("Contract fetched");

    const token = await contractsRegistryContract.deploy();

    console.log("Contract address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
