import { ethers } from "hardhat";

const fs = require('fs')
const filename  = "deployed_info.json"
const conf = JSON.parse(fs.readFileSync(filename, 'utf8'));

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];

  // EN bridge operator
  const enop = conf.parent.operator;
  console.log('\n\nEN operator:', enop);

  // EN bridge 
  const ENbridge = await ethers.getContractFactory("Bridge");
  const enbridge = await ENbridge.deploy(false);
  await enbridge.deployed();
  await enbridge.registerOperator(enop);
  conf.parent.bridge = enbridge.address; 
  console.log('EN bridge address: ', enbridge.address);

  // EN ERC20 Token
  const ENtoken = await ethers.getContractFactory("ServiceChainToken");
  const entoken = await ENtoken.deploy(enbridge.address, {gasLimit: 3e7});
  await entoken.deployed(enbridge.address);
  await entoken.addMinter(enbridge.address);
  conf.parent.token = entoken.address;
  console.log('EN Token address: ', entoken.address);
  console.log('\n\n');

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