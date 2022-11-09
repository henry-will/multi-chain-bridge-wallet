import { ethers } from "hardhat";

const fs = require('fs')
const filename  = "deployed_info.json"
const conf = JSON.parse(fs.readFileSync(filename, 'utf8'));

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];

  console.log('\n\nEN operator:', conf.parent.operator);

  // Deploy bridge on EN
  const ENbridge = await ethers.getContractFactory("Bridge", {signer: owner});
  const enBridge = await ENbridge.deploy(false);
  await enBridge.deployed();
  conf.parent.bridge = enBridge.address; 
  console.log('EN bridge address: ', enBridge.address);

  // Deploy ERC20 Token on EN
  const ENtoken = await ethers.getContractFactory("ServiceChainToken", {signer: owner});
  const enToken = await ENtoken.deploy();
  await enToken.deployed();
  conf.parent.token = enToken.address;
  console.log('EN Token address: ', enToken.address);

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