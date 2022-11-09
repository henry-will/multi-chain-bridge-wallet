import { ethers } from "hardhat";

const fs = require('fs')
const filename  = "deployed_info.json"
const conf = JSON.parse(fs.readFileSync(filename, 'utf8'));

async function jsonRpcReq(url, log, method, params) {
  if (typeof jsonRpcReq.id == undefined) jsonRpcReq.id = 0;

  console.log(log)
  await axios.post(url, {
      "jsonrpc":"2.0","method":method,"params":params,"id": jsonRpcReq.id++
  }).then(res => {
    if (res.data.error != undefined) {
      console.log(res.data.error);
      process.exit(res.data.code);
    }
  }).catch(err => {
    if (err != undefined) {
      console.log(err);
      process.exit(1);
    }
  });
}

async function main() {

  const signers = await ethers.getSigners();
  const owner = signers[0];

  const SCNbridge = await ethers.getContractFactory("Bridge");
  const scnBridge = await SCNbridge.attach( conf.child.bridge );
  
  const SCNtoken = await ethers.getContractFactory("ServiceChainToken");
  const scnToken = await SCNtoken.attach( conf.child.token );

  // setting
  await scnToken.addMinter(conf.child.bridge);
  await scnBridge.registerOperator(conf.child.operator);  
  await scnBridge.registerToken( conf.child.token, conf.parent.token );
  await scnBridge.transferOwnership( conf.child.operator );


  const url = conf.child.url;
  log = 'registering bridges to the child node'
  await jsonRpcReq(url, log, 'subbridge_registerBridge', [conf.child.bridge, conf.parent.bridge]);

  log = 'subscribing bridges to the child node'
  await jsonRpcReq(url, log, 'subbridge_subscribeBridge', [conf.child.bridge, conf.parent.bridge]);

  log = 'register token to subbridge..'
  await jsonRpcReq(url, log, 'subbridge_registerToken', [conf.child.bridge, conf.parent.bridge, conf.child.token, conf.parent.token]);


  console.log(`subbridge.registerBridge("${conf.child.bridge}", "${conf.parent.bridge}")`)
  console.log(`subbridge.subscribeBridge("${conf.child.bridge}", "${conf.parent.bridge}")`)
  console.log(`subbridge.registerToken("${conf.child.bridge}", "${conf.parent.bridge}", "${conf.child.token}", "${conf.parent.token}")`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });