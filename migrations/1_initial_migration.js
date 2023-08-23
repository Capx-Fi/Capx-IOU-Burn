const TestToken = artifacts.require("TestToken");
const ClaimCapx = artifacts.require("ClaimCapx");

module.exports = async function(deployer, network, accounts) {
    // Deploy CAPX Token
    await deployer.deploy(TestToken);
    const capxToken = await TestToken.deployed();
    console.log("CAPX Token deployed at:", capxToken.address);

    // Deploy xCAPX Token
    await deployer.deploy(TestToken);
    const xcapxToken = await TestToken.deployed();
    console.log("xCAPX Token deployed at:", xcapxToken.address);

    // Deploy ClaimCapx contract with addresses of CAPX and xCAPX tokens
    await deployer.deploy(ClaimCapx, capxToken.address, xcapxToken.address);
    const claimCapx = await ClaimCapx.deployed();
    console.log("ClaimCapx contract deployed at:", claimCapx.address);

    // Deposit CAPX tokens into ClaimCapx contract
    const depositAmount = web3.utils.toWei("1000", "ether");
    await capxToken.approve(claimCapx.address, depositAmount);
    await claimCapx.depositToken(capxToken.address, depositAmount);

    let contractBalance = await capxToken.balanceOf(claimCapx.address);
    if (contractBalance.toString() === depositAmount) {
        console.log("Successfully deposited 1000 CAPX into ClaimCapx contract!");
    } else {
        console.error("Failed to deposit CAPX into ClaimCapx contract.");
    }

    // Burn xCAPX IOU tokens
    const burnAmount = web3.utils.toWei("500", "ether");
    await xcapxToken.approve(claimCapx.address, burnAmount, {from: accounts[0]});
    await claimCapx.burnIOU(xcapxToken.address, burnAmount);

    let userClaimAmount = await claimCapx.claimMap(accounts[0]);
    if (userClaimAmount.toString() === burnAmount) {
        console.log("Successfully burned 500 xCAPX IOU tokens!");
    } else {
        console.error("Failed to burn xCAPX IOU tokens.");
    }

    // Claim CAPX tokens using xCAPX IOU tokens
    const claimAmount = web3.utils.toWei("200", "ether");
    await xcapxToken.approve(claimCapx.address, claimAmount, {from: accounts[0]});
    await claimCapx.claimIOU(xcapxToken.address, claimAmount);

    contractBalance = await capxToken.balanceOf(claimCapx.address);
    userClaimAmount = await claimCapx.claimMap(accounts[0]);
    if (contractBalance.toString() === web3.utils.toWei("800", "ether") && userClaimAmount.toString() === web3.utils.toWei("300", "ether")) {
        console.log("Successfully claimed 200 CAPX using xCAPX IOU tokens!");
    } else {
        console.error("Failed to claim CAPX using xCAPX IOU tokens.");
    }


    // Burn and claim in a single transaction
    const amount = web3.utils.toWei("100", "ether");
    await xcapxToken.approve(claimCapx.address, amount, {from: accounts[0]});
    await claimCapx.burnAndClaim(xcapxToken.address, amount);

    contractBalance = await capxToken.balanceOf(claimCapx.address);
    userClaimAmount = await claimCapx.claimMap(accounts[0]);

    if (contractBalance.toString() === web3.utils.toWei("700", "ether") && userClaimAmount.toString() === web3.utils.toWei("300", "ether")) {
        console.log("Successfully burned and claimed 100 CAPX in a single transaction!");
    } else {
        console.error("Failed to burn and claim CAPX in a single transaction.");
    }
};
