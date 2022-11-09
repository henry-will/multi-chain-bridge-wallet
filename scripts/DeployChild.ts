import { ethers } from "hardhat";

const fs = require('fs')
const filename  = "deployed_info.json"
const conf = JSON.parse(fs.readFileSync(filename, 'utf8'));

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];

  console.log('\n\nSCN operator:', conf.child.operator);

  // Deploy bridge on SCN
  const SCNbridge = await ethers.getContractFactory("Bridge", {signer: owner});
  const scnBridge = await SCNbridge.deploy();
  await scnBridge.deployed();
  conf.child.bridge = scnBridge.address; 
  console.log('SCN bridge address: ', scnBridge.address);

  // Deploy ERC20 Token on SCN
  const SCNtoken = await ethers.getContractFactory("ServiceChainToken", {signer: owner});
  const scnToken = await SCNtoken.deploy();
  await scnToken.deployed();
  conf.child.token = scnToken.address;
  console.log('SCN Token address: ', scnToken.address);

  fs.writeFileSync(filename, JSON.stringify(conf), (err) => {
      if (err) {
          console.log("Error:", err);
      }
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });