const {ethers} = require("hardhat");
const {expect} = require("chai");

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }


describe("Opportunity Contract", function () {
    const contractName = "myOpportunityToken"
    const contractSymbol = "OPP"
    const nominalAmount = "1" // ETH
    const interestRatePerCent = ethers.parseEther("0.1");
    const interestRatePeriodAdjusted = ethers.parseEther("0.008333333333333333");
    const minimalTokenTranche = ethers.parseEther("0.001"); // ETH
    const tokenPrice = ethers.parseEther("0.1"); // ETH
    const numberOfTotalPayouts = BigInt("2");
    const subscriptionPeriodDeadline = 10;
    const contractId = ethers.id("opportunity_name");
    let opportunityContract;
    let managementContract;
    let opportunityContractObject;
    let opportunityContractAdress;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const ManagementContractDeployment = await ethers.getContractFactory("CONTROL_MANAGEMENT");
        managementContract = await ManagementContractDeployment.deploy();
        await managementContract.waitForDeployment();
        await managementContract.initialize();
        opportunityContract = await ethers.getContractFactory("OpportunityContract");
        const add  = await managementContract.getAddress();
        opportunityContractObject = await opportunityContract.deploy(
            contractName,
            contractSymbol,
            ethers.parseEther(nominalAmount),
            interestRatePerCent,
            minimalTokenTranche,
            numberOfTotalPayouts,
            subscriptionPeriodDeadline,
            interestRatePeriodAdjusted,
            add,
        );
        await opportunityContractObject.waitForDeployment();
        opportunityContractAdress = await opportunityContractObject.getAddress()
        const registerContract = await managementContract.registerNewOpportunity(contractId, opportunityContractAdress);
        await registerContract.wait();

        const registerInvestor =  await managementContract.registerNewInvestor(addr1.address);
        await registerInvestor.wait();

        const registerInvestorToContract = await managementContract.registerInvestorToOpportunity(addr1.address,  opportunityContractAdress);
        await registerInvestorToContract.wait();
        const tx = await owner.sendTransaction({
            to: opportunityContractAdress,
            value: ethers.parseEther("11"), // Send the exact token price
        });
    });

    describe("Deployment", function () {
        it("Should be deployed with expected name and symbol", async function () {
            expect(await opportunityContractObject.name()).to.equal(contractName);
            expect(await opportunityContractObject.symbol()).to.equal(contractSymbol);
        });

        it("Should set the right owner", async function () {
            expect(await opportunityContractObject.owner()).to.equal(owner.address);
        });

        it("Should have total supply equals to zero", async function () {
            expect(await opportunityContractObject.totalSupply()).to.equal(0);
        });
    });

    describe("Mint", function () {
        it("Should allow mint via transferring the ETH from the non-owner", async function () {
            const tx = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token prices
            });

            await tx.wait();

            expect(await opportunityContractObject.totalSupply()).to.equal(1);
        });

        it("Should allow transferring the ETH from the owner and don't mint", async function () {
            const tx = await owner.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            expect(await opportunityContractObject.totalSupply()).to.equal(0);
        });
    });

    describe("Get by public key", function () {
        it("should return two minted tokens", async function () {

            // Mint tokens
            const tx1 = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            const tx2 = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            const tx3 = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx1.wait();
            await tx2.wait();
            await tx3.wait();

            let a = await opportunityContractObject.getTokenMetaByPublicKey(addr1.address);
            expect(a.length).to.equal(3);
            expect(a[0]["id"]).to.equal(BigInt("1"));
            expect(a[1]["id"]).to.equal(BigInt("2"));
            expect(a[0]["owner"]).to.equal(addr1.address);
            expect(a[1]["owner"]).to.equal(addr1.address);
        });

        it("should return empty array", async function () {
            let a = await opportunityContractObject.getTokenMetaByPublicKey(addr1.address);
            expect(a.length).to.equal(0);
        });

        it("should return empty array after burn", async function () {

            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            await opportunityContractObject.connect(owner).burn(BigInt("1"))
            let a = await opportunityContractObject.getTokenMetaByPublicKey(addr1.address);
            expect(a.length).to.equal(0);
        });

    });

    describe("Balance of", function () {
        it("should return balance for given account", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            expect(await opportunityContractObject.balanceOf(addr1.address)).to.equal(1);
        });
    });

    describe("Burn", function () {
        it("contract owner should burn the token", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            await opportunityContractObject.connect(owner).burn(BigInt("1"))
            expect(await opportunityContractObject.balanceOf(addr1.address)).to.equal(0);
        });

        it("non contract owner should NOT burn the token", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();

            await expect(
                opportunityContractObject.connect(addr1).burn(BigInt("1"))
            ).to.be.revertedWith("Ownable: caller is not the owner");

            // If necessary, you can still assert the state after the failed transaction attempt
            expect(await opportunityContractObject.balanceOf(addr1.address)).to.equal(1);
        });
    });

    describe("Pay interest rates", function () {
        it("should pay interest rates for token holder", async function () {
            // Mint token
            const tx = await addr1.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice, // Send the exact token price
            });

            await tx.wait();
            // Fund the contract
            const tx2 = await owner.sendTransaction({
                to: opportunityContractAdress,
                value: tokenPrice,
            });
            await tx2.wait();

            const initialBalance = await ethers.provider.getBalance(addr1.address);
            const initialBalancecontract = await ethers.provider.getBalance(opportunityContractAdress);
            console.log(ethers.formatEther(initialBalancecontract))
            let tokenid = await opportunityContractObject.getTokenMetaByPublicKey(addr1.address);

            const payTx1 = await opportunityContractObject.connect(owner).payInterestsToAllHolders();
            await payTx1.wait();
            const intermediateBalance = await ethers.provider.getBalance(addr1.address);
            expect(intermediateBalance).to.greaterThan( initialBalance );
            const payment = await opportunityContractObject.connect(owner).getTokenMeta(BigInt(`${tokenid[0][0]}`));
            expect(intermediateBalance).to.equal(initialBalance +  payment[4][0][1]);
            
            const executedPayouts = await opportunityContractObject.numberOfExecutedPayouts();
            expect(executedPayouts).to.equal(1);

            // Do one more payment and check if the investment is paid out

            const payTx2 = await opportunityContractObject.connect(owner).payInterestsToAllHolders();
            await payTx2.wait();
            const finalBalance = await ethers.provider.getBalance(addr1.address);
            expect(finalBalance).to.greaterThan(intermediateBalance);

            const executedFinalPayouts = await opportunityContractObject.numberOfExecutedPayouts();
            expect(executedFinalPayouts).to.equal(2);
        });
    });
});
