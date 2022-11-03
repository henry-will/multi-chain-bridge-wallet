import { ethers } from "hardhat";

const fs = require('fs')
const filename  = "deployed_info.json"
const conf = JSON.parse(fs.readFileSync(filename, 'utf8'));

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];
  console.log( signers[0].address );
  
  console.log('\n\n', conf);

  const ENbridge = await ethers.getContractFactory("Bridge");
  const enbridge = await ENbridge.attach( conf.parent.bridge );

  const ENtoken = await ethers.getContractFactory("ServiceChainToken");
  const entoken = await ENtoken.attach( conf.parent.token );

  // const SCbridge = await ethers.getContractFactory("Bridge");
  // const scbridge = await SCbridge.attach( conf.child.bridge );
  
  // const SCtoken = await ethers.getContractFactory("ServiceChainToken");
  // const sctoken = await SCtoken.attach( conf.child.token );

  // EN-SCN pair register
  await enbridge.registerToken( conf.parent.token, conf.child.token);
  await enbridge.transferOwnership( conf.parent.operator );

  // // SCN-EN pair register
  // await scbridge.registerToken( conf.child.token, conf.parent.token );
  // await scbridge.transferOwnership( conf.child.operator );

  // console.log(`subbridge.registerBridge("${scbridge.address}", "${enbridge.address}")`)
  // console.log(`subbridge.subscribeBridge("${scbridge.address}", "${enbridge.address}")`)
  // console.log(`subbridge.registerToken("${scbridge.address}", "${enbridge.address}", "${sctoken.address}", "${entoken.address}")`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });