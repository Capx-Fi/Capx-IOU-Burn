// SPDX-License-Identifier: MIT
const TestToken = artifacts.require("TestToken");
const Eater = artifacts.require("Eater");

module.exports = async function (deployer, network, accounts) {
  // Deploy TestToken contract
  await deployer.deploy(TestToken);
  const testTokenInstance = await TestToken.deployed();

  // Deploy Eater contract
  await deployer.deploy(Eater);
  const eaterInstance = await Eater.deployed();

// Example 5: Deposit TestToken into Eater contract and log balance change
const depositAmount = web3.utils.toWei("1000", "ether"); // Amount in wei
const ownerBalanceBefore = await testTokenInstance.balanceOf(accounts[0]);
const contractBalanceBefore = await testTokenInstance.balanceOf(eaterInstance.address);
const contractMappingBalanceBefore = await eaterInstance.tokenBalances(testTokenInstance.address);

await testTokenInstance.approve(eaterInstance.address, depositAmount, { from: accounts[0] });
await eaterInstance.depositToken(testTokenInstance.address, depositAmount);

const ownerBalanceAfter = await testTokenInstance.balanceOf(accounts[0]);
const contractBalanceAfter = await testTokenInstance.balanceOf(eaterInstance.address);
const contractMappingBalanceAfter = await eaterInstance.tokenBalances(testTokenInstance.address);

console.log(`Owner balance before: ${ownerBalanceBefore.toString()}`);
console.log(`Owner balance after: ${ownerBalanceAfter.toString()}`);
console.log(`Contract balance before: ${contractBalanceBefore.toString()}`);
console.log(`Contract balance after: ${contractBalanceAfter.toString()}`);
console.log(`Contract mapping balance before: ${contractMappingBalanceBefore.toString()}`);
console.log(`Contract mapping balance after: ${contractMappingBalanceAfter.toString()}`);
console.log(`Deposited ${depositAmount} TestToken into Eater contract.`);

};
