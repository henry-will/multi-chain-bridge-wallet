import { ethers } from 'hardhat';
import Caver from 'caver-js';
import fs from 'fs';
import { NetworkParam, TokenParam, BridgeParam } from './DeployInterface';
import { addBridge, deployBridgeService, deployIterableBridgeMap, getBridgeContract, updateChildBridgeTokens } from './DeployBridgeService';
import { deployTokenService, getChildBridgeTokens, getNetworkTokens, getTokenContract } from './DeployTokenService';
import { addNetwork, deployIterableNetworkMap, deployNetworkService, deployStringUtil, getNetworkContract, getNetworks } from './DeployNetworkService';

const conf = JSON.parse(fs.readFileSync('./value-transfer/config/deploy-bridge.json', 'utf8'));

const managerPrivateKey = conf.contractOwner.parent;
const deployRpcUrl = conf.url.parent;
const childRpcUrl = conf.url.child;
const parentBridgeAddress = conf.bridge.parent;
const childBridgeAddress = conf.bridge.child;
const childPrivateKey = conf.contractOwner.child;

async function getOwnerAndGasPrice(url: string, privateKey: string) {
    const provider = new ethers.providers.JsonRpcProvider(url);
    const owner = new ethers.Wallet(privateKey, provider)
    const gasPrice = await provider.getGasPrice()
    console.log(`${url} gas price is ${gasPrice}`);
    return { owner, gasPrice };
}
function getCaverAndUnlockedPublicKey(url: string, publicKey: string, privateKey: string) {
    const caver = new Caver(url);
    const keyring = new caver.wallet.keyring.singleKeyring(publicKey, privateKey);
    const account = caver.wallet.add(keyring).address;
    return { caver, account };
}
async function main() {
    const { owner, gasPrice } = await getOwnerAndGasPrice(deployRpcUrl, managerPrivateKey);
    const { caver, account } = getCaverAndUnlockedPublicKey(deployRpcUrl, owner.address, managerPrivateKey);
    const contractOwner = account;

    const stringUtilAddress: string = await deployStringUtil(owner, gasPrice);
    const iterableNetworkMapAddress: string = await deployIterableNetworkMap(owner, gasPrice, stringUtilAddress);
    const deployIterableBridgeAddress = await deployIterableBridgeMap(owner, gasPrice, stringUtilAddress);

    const networkService = await deployNetworkService(owner, gasPrice, stringUtilAddress, iterableNetworkMapAddress);
    const bridgeService = await deployBridgeService(owner, gasPrice, deployIterableBridgeAddress);

    const networkParam: NetworkParam = { chainId: '1000', shortName: 'MBX', name: 'MARBLEX', rpcUrl: childRpcUrl, networkId: 9999 };
    const tokenParam: TokenParam = { symbol: 'MBX', name: 'MARBLEX', decimals: 18 };
    const networkContract = await getNetworkContract(caver, networkService.address, contractOwner);
    const key = await addNetwork(networkContract, contractOwner, networkParam, tokenParam);

    const bridgeContract = await getBridgeContract(caver, bridgeService.address, contractOwner);
    const bridgeParam: BridgeParam = { networkKey: key, parentName: 'parent henry', parentBridge: parentBridgeAddress, childName: 'child henry', childBridge: childBridgeAddress };
    await addBridge(bridgeContract, contractOwner, bridgeParam);

    // child chain
    const childOwner = await getOwnerAndGasPrice(childRpcUrl, childPrivateKey);
    const childCaver = getCaverAndUnlockedPublicKey(childRpcUrl, childOwner.owner.address, childPrivateKey);
    const childContractOwner = childCaver.account;
    const tokenService = await deployTokenService(childOwner.owner, childOwner.gasPrice);
    const tokenContract = await getTokenContract(childCaver.caver, tokenService.address, childContractOwner);
    const childTokens = await getChildBridgeTokens(tokenContract, childBridgeAddress, childContractOwner);

    await updateChildBridgeTokens(deployRpcUrl, bridgeContract.options.address, contractOwner, managerPrivateKey, key, childBridgeAddress, childTokens);

    const networks = await getNetworks(deployRpcUrl, contractOwner, managerPrivateKey, networkContract.options.address);
    console.log('networks ', networks);

    const networkTokens = await getNetworkTokens(deployRpcUrl, contractOwner, managerPrivateKey, bridgeContract.options.address, networkContract.options.address, key);
    console.log('networks ', networkTokens);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
