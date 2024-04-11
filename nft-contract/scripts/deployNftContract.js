// const contractName = process.env["ETHEREUM_CONTRACT_NAME"]
const contractName = "myOpportunityToken"
const contractSymbol = "OPP"
const contractClass = "NftContract"

const amount = "1" // ETH
const interestRatePerCent = 30
const tokenPrice = "0.001" // ETH
const payoutInterval = 10// in seconds
const numberOfTotalPayouts = 4// in seconds

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const nftContract = await ethers.getContractFactory(contractClass);

    console.log("Contract fetched");

    const token = await nftContract.deploy(
        contractName,
        contractSymbol,
        ethers.utils.parseEther(amount),
        interestRatePerCent,
        ethers.utils.parseEther(tokenPrice),
        payoutInterval,
        numberOfTotalPayouts
    );

    console.log("Contract address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
