import { ethers } from "hardhat";

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];

  // EN bridge operator
  const enop = signers[1];
  console.log('\n\nEN operator:', enop.address);

  // EN bridge 
  const ENbridge = await ethers.getContractFactory("Bridge", {signer: owner});
  const enbridge = await ENbridge.deploy(false);
  await enbridge.deployed();
  await enbridge.registerOperator(enop.address);
  console.log('EN bridge address: ', enbridge.address);

  // EN ERC20 Token
  const ENtoken = await ethers.getContractFactory("ServiceChainToken", {signer: owner});
  const entoken = await ENtoken.deploy(enbridge.address);
  await entoken.deployed(enbridge.address);
  await entoken.addMinter(enbridge.address);
  console.log('EN Token address: ', entoken.address);

  
  // SCN bridge operator
  const scop = signers[2];
  console.log('\n\nSCN operator:', scop.address);

  // SCN bridge
  const SCbridge = await ethers.getContractFactory("Bridge", {signer: owner});
  const scbridge = await SCbridge.deploy(false);
  await scbridge.deployed();
  await scbridge.registerOperator(scop.address);
  console.log('SCN bridge address: ', scbridge.address);

  // SCN ERC20 Token 
  const SCtoken = await ethers.getContractFactory("ServiceChainToken", {signer: owner});
  const sctoken = await SCtoken.deploy(scbridge.address);
  await sctoken.deployed(scbridge.address);
  await sctoken.addMinter(scbridge.address);
  console.log('SCN Token address: ', sctoken.address);
  console.log('\n\n');


  // EN-SCN pair register
  await enbridge.registerToken(entoken.address, sctoken.address);
  await enbridge.transferOwnership(enop.address);

  // SCN-EN pair register
  await scbridge.registerToken(sctoken.address, entoken.address);
  await scbridge.transferOwnership(scop.address);


  // console.log(`subbridge.registerBridge("${scbridge.address}", "${enbridge.address}")`)
  // console.log(`subbridge.subscribeBridge("${scbridge.address}", "${enbridge.address}")`)
  // console.log(`subbridge.registerToken("${scbridge.address}", "${enbridge.address}", "${sctoken.address}", "${entoken.address}")`)

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
  console.log("EN bridge's balance before requestValueTransfer:", bal6.toNumber());
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