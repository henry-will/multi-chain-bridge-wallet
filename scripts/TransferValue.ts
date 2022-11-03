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


  const alice = '0xc40b6909eb7085590e1c26cb3becc25368e249e9';
  const bal1 = await entoken.balanceOf(owner.address);
  console.log("signer's balance before requestValueTransfer:", bal1.toString());
  const bal2 = await entoken.balanceOf(enbridge.address);
  console.log("EN bridge's balance before requestValueTransfer:", bal2.toNumber());
  const bal3 = await entoken.balanceOf(entoken.address);
  console.log("EN Token's balance before requestValueTransfer:", bal3.toNumber());
  const bal4 = await entoken.balanceOf(alice);
  console.log("alice's balance before requestValueTransfer:", bal4.toNumber());

  // request to the token contract
  const tx = await entoken.requestValueTransfer(100, alice, 0, []);
  console.log( tx );

  // // direct request to the bridge
  // await entoken.approve(enbridge.address, 100);
  // await enbridge.requestERC20Transfer(entoken.address, alice, 100, 0, []);
  // bal = await entoken.balanceOf(enbridge.address);
  // console.log("ENbridge balance after requestERC20Transfer:", bal.toNumber());

  const bal5 = await entoken.balanceOf(owner.address);
  console.log("signer's balance after requestValueTransfer:", bal5.toString());
  const bal6 = await entoken.balanceOf(enbridge.address);
  console.log("EN bridge's balance after requestValueTransfer:", bal6.toNumber());
  const bal7 = await entoken.balanceOf(entoken.address);
  console.log("EN Token's balance after requestValueTransfer:", bal7.toNumber());
  const bal8 = await entoken.balanceOf(alice);
  console.log("alice balance after requestValueTransfer:", bal8.toNumber());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });