const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("NFT contract", function () {
    const contractName = "myOpportunityToken"
    const contractSymbol = "OPP"
    const amount = "1" // ETH
    const interestRatePerCent = 10
    const tokenPrice = ethers.utils.parseEther("0.001") // ETH
    const payoutInterval = 10 // in seconds
    const numberOfTotalPayouts = 2
    let nftContract;
    let opportunityContract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        nftContract = await ethers.getContractFactory("NftContract");
        opportunityContract = await nftContract.deploy(
            contractName,
            contractSymbol,
            ethers.utils.parseEther(amount),
            interestRatePerCent,
            tokenPrice,
            payoutInterval,
            numberOfTotalPayouts
        );

        await opportunityContract.deployed();
    });

    describe("Deployment", function () {
        it("Should be deployed with expected name and symbol", async function () {
            expect(await opportunityContract.name()).to.equal(contractName);
            expect(await opportunityContract.symbol()).to.equal(contractSymbol);
        });

        it("Should set the right owner", async function () {
            expect(await opportunityContract.owner()).to.equal(owner.address);
        });

        it("Should have total supply equals to zero", async function () {
            expect(await opportunityContract.totalSupply()).to.equal(0);
        });
    });

    describe("Mint", function () {
        it("Should allow mint via transferring the ETH from the non-owner", async function () {
            const tx = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            expect(await opportunityContract.totalSupply()).to.equal(1);
        });

        it("Should allow transferring the ETH from the owner and don't mint", async function () {
            const tx = await owner.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            expect(await opportunityContract.totalSupply()).to.equal(0);
        });
    });

    describe("Get by public key", function () {
        it("should return two minted tokens", async function () {

            // Mint tokens
            const tx1 = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            const tx2 = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            const tx3 = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx1.wait();
            await tx2.wait();
            await tx3.wait();

            let a = await opportunityContract.getTokenMetaByPublicKey(addr1.address);
            expect(a.length).to.equal(3);
            expect(a[0]["id"]).to.equal(ethers.BigNumber.from("1"));
            expect(a[1]["id"]).to.equal(ethers.BigNumber.from("2"));
            expect(a[0]["owner"]).to.equal(addr1.address);
            expect(a[1]["owner"]).to.equal(addr1.address);
        });

        it("should return empty array", async function () {
            let a = await opportunityContract.getTokenMetaByPublicKey(addr1.address);
            expect(a.length).to.equal(0);
        });

        it("should return empty array after burn", async function () {

            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            await opportunityContract.connect(owner).burn(ethers.BigNumber.from("1"))
            let a = await opportunityContract.getTokenMetaByPublicKey(addr1.address);
            expect(a.length).to.equal(0);
        });

    });

    describe("Balance of", function () {
        it("should return balance for given account", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            expect(await opportunityContract.balanceOf(addr1.address)).to.equal(1);
        });
    });

    describe("Burn", function () {
        it("contract owner should burn the token", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            await opportunityContract.connect(owner).burn(ethers.BigNumber.from("1"))
            expect(await opportunityContract.balanceOf(addr1.address)).to.equal(0);
        });

        it("non contract owner should NOT burn the token", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            await expect(
                opportunityContract.connect(addr1).burn(ethers.BigNumber.from("1"))
            ).to.be.revertedWith("Ownable: caller is not the owner");

            // If necessary, you can still assert the state after the failed transaction attempt
            expect(await opportunityContract.balanceOf(addr1.address)).to.equal(1);
        });
    });

    describe("Pay interest rates", function () {
        it("should pay interest rates for token holder", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            // Fund the contract
            const tx2 = await owner.sendTransaction({
                to: opportunityContract.address,
                value: tokenPrice,
            });

            await tx2.wait();

            // Simulate passing of the payout interval
            await ethers.provider.send("evm_increaseTime", [payoutInterval]);
            await ethers.provider.send("evm_mine");

            const initialBalance = await ethers.provider.getBalance(addr1.address);

            const payTx1 = await opportunityContract.connect(owner).payInterestsToAllHolders();
            await payTx1.wait();

            const expectedInterestsPerPayout = (tokenPrice.mul(interestRatePerCent).div(100)).div(numberOfTotalPayouts);

            const intermediateBalance = await ethers.provider.getBalance(addr1.address);
            expect(intermediateBalance).to.equal(initialBalance.add(expectedInterestsPerPayout));

            const executedPayouts = await opportunityContract.numberOfExecutedPayouts();
            expect(executedPayouts).to.equal(1);

            // Do one more payment and check if the investment is paid out

            // Simulate passing of the payout interval
            await ethers.provider.send("evm_increaseTime", [payoutInterval]);
            await ethers.provider.send("evm_mine");

            const payTx2 = await opportunityContract.connect(owner).payInterestsToAllHolders();
            await payTx2.wait();

            const finalBalance = await ethers.provider.getBalance(addr1.address);
            const expectedPayout = tokenPrice.add(expectedInterestsPerPayout);
            expect(finalBalance).to.equal(intermediateBalance.add(expectedPayout));

            const executedFinalPayouts = await opportunityContract.numberOfExecutedPayouts();
            expect(executedFinalPayouts).to.equal(2);
        });
    });
});
