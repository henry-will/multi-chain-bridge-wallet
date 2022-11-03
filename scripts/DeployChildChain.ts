import { ethers } from "hardhat";

const fs = require('fs')
const filename  = "deployed_info.json"
const conf = JSON.parse(fs.readFileSync(filename, 'utf8'));

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];
  console.log( signers[0].address );
  
  // SCN bridge operator
  const scop = conf.child.operator; 
  console.log('\n\nSCN operator:', scop);

  // SCN bridge
  const SCbridge = await ethers.getContractFactory("Bridge");
  const scbridge = await SCbridge.deploy(false, {gasLimit: 3e7});
  await scbridge.deployed();
  await scbridge.registerOperator(scop);
  conf.child.bridge = scbridge.address; 
  console.log('SCN bridge address: ', scbridge.address);

  // SCN ERC20 Token 
  const SCtoken = await ethers.getContractFactory("ServiceChainToken");
  const sctoken = await SCtoken.deploy(scbridge.address, {gasLimit: 3e7});
  await sctoken.deployed(scbridge.address);
  await sctoken.addMinter(scbridge.address);
  conf.child.token = sctoken.address;
  console.log('SCN Token address: ', sctoken.address);
  console.log('\n\n');

  console.log( conf );
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