const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("Opportunity Contract Interest Payment", function () {
    const contractName = "Opportunity Test"
    const contractSymbol = "OPP"
    const nominalAmount = ethers.parseEther("1");               // 1000000000000000000 (18 zeros)
    const interestRatePercent = ethers.parseEther("10");        // 10000000000000000000 (19 zeros)
    const minimalTokenTranche = ethers.parseEther("0.001");      // 100000000000000 (14 zeros)
    const numberOfTotalPayouts = BigInt(2);
    const subscriptionPeriodDeadline = 10;
    const interestRatePeriodAdjusted = ethers.parseEther("0.008333333333333333");

    const contractId = ethers.id("opportunity_name");
    let opportunityContractObject;
    let opportunityContractAddress;
    let owner;
    let investor1;
    let investor2;

    beforeEach(async function () {
        [owner, investor1, investor2] = await ethers.getSigners();
        const managementContractDeployment = await ethers.getContractFactory("CONTROL_MANAGEMENT");
        const managementContract = await managementContractDeployment.deploy();
        await managementContract.waitForDeployment();
        await managementContract.initialize();

        const opportunityContract = await ethers.getContractFactory("OpportunityContract");
        const managementContractAddress = await managementContract.getAddress();

        opportunityContractObject = await opportunityContract.deploy(
            contractName,
            contractSymbol,
            nominalAmount,
            interestRatePercent,
            minimalTokenTranche,
            numberOfTotalPayouts,
            subscriptionPeriodDeadline,
            interestRatePeriodAdjusted,
            managementContractAddress,
        );

        await opportunityContractObject.waitForDeployment();
        opportunityContractAddress = await opportunityContractObject.getAddress()
        const registerContract = await managementContract.registerNewOpportunity(contractId, opportunityContractAddress);
        await registerContract.wait();

        const registerInvestor1 = await managementContract.registerNewInvestor(investor1.address);
        await registerInvestor1.wait();

        const registerInvestorToContract1 = await managementContract.registerInvestorToOpportunity(investor1.address, opportunityContractAddress);
        await registerInvestorToContract1.wait();

        const registerInvestor2 = await managementContract.registerNewInvestor(investor2.address);
        await registerInvestor2.wait();

        const registerInvestorToContract2 = await managementContract.registerInvestorToOpportunity(investor2.address, opportunityContractAddress);
        await registerInvestorToContract2.wait();

        await owner.sendTransaction({to: opportunityContractAddress, value: ethers.parseEther("11")});
    });

    describe("Interest Payment Schedule", function () {
        it("should pay interest to token holders in proportion to their investment", async function () {
            const investor1TokenPrice = ethers.parseEther("0.001");
            const investor2TokenPrice = ethers.parseEther("0.002");

            // Mint 2 tokens
            const tx = await investor1.sendTransaction({to: opportunityContractAddress, value: investor1TokenPrice});
            await tx.wait();
            const tx2 = await investor2.sendTransaction({to: opportunityContractAddress, value: investor2TokenPrice});
            await tx2.wait();

            let investor1TokenInfo = await opportunityContractObject.getTokenMetaByPublicKey(investor1.address);
            let investor1TokenId = BigInt(investor1TokenInfo[0][0])
            let investor2TokenInfo = await opportunityContractObject.getTokenMetaByPublicKey(investor2.address);
            let investor2TokenId = BigInt(investor2TokenInfo[0][0])

            // Interest Payment 1
            const payTx1 = await opportunityContractObject.connect(owner).payInterestsToAllHolders();
            await payTx1.wait();

            // Interest Payment 2 (last)
            const payTx2 = await opportunityContractObject.connect(owner).payInterestsToAllHolders();
            await payTx2.wait();

            const executedFinalPayouts = await opportunityContractObject.numberOfExecutedPayouts();
            expect(executedFinalPayouts).to.equal(2);

            const investor1TokenInfoUpdated = await opportunityContractObject.connect(owner).getTokenMeta(investor1TokenId);
            logTokenInfo(investor1TokenInfoUpdated, "investor1")

            const investor2TokenInfoUpdated = await opportunityContractObject.connect(owner).getTokenMeta(investor2TokenId);
            logTokenInfo(investor2TokenInfoUpdated, "investor2")

            // Verify interest payments
            expect(investor1TokenInfoUpdated[4][0][1]).to.equal(8333333333333)
            expect(investor1TokenInfoUpdated[4][1][1]).to.equal(1008333333333333)

            expect(investor2TokenInfoUpdated[4][0][1]).to.equal(16666666666666)
            expect(investor2TokenInfoUpdated[4][1][1]).to.equal(2016666666666666)

            // Interest Payment 3 (should fail because numberOfTotalPayouts = 2)
            await expect(
                opportunityContractObject.connect(owner).payInterestsToAllHolders()
            ).to.be.revertedWith("all interest payments have been paid for this opportunity");
        });
    });
});

function logTokenInfo(tokenInfo, investorName) {
    console.log(investorName + ": tokenInfo = " + tokenInfo)
    console.log(investorName + ": tokenInfo[4][0][1] (paymentsList[0].value) = " + tokenInfo[4][0][1])
    console.log(investorName + ": tokenInfo[4][1][1] (paymentsList[1].value) = " + tokenInfo[4][1][1])
}

// struct tokenInfo {
//     uint256 id;
//     address owner;
//     uint256 value;
//     uint256 paidInterests;
//     interestPayment[] paymentsList;
// }

// struct interestPayment {
//     uint256 time;
//     uint256 value;
// }
