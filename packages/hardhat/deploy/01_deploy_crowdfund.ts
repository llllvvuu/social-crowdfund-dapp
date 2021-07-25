// deploy/00_deploy_your_contract.js

import { ethers } from "hardhat";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const contract = await deploy("Crowdfund", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", utils.parseEther("1.5") ],
    log: true,
  });

  const deployedContract = await ethers.getContract("Crowdfund", deployer);
  await deployedContract.startCampaign(true, ethers.utils.parseEther("1"), ethers.constants.MaxUint256);

  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
};
module.exports.tags = ["Crowdfund"];
