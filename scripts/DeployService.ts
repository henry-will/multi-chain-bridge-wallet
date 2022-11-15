import { Contract } from 'caver-js';
import fs from 'fs';
import { NetworkParam, TokenParam, BridgeParam, Network, Token } from './DeployInterface';
import { addBridge, deployBridgeService, deployIterableBridgeMap, getBridgeContract, updateChildBridgeTokens, updateChildBridgeTokens2 } from './DeployBridgeService';
import { deployTokenService, getChildBridgeTokens, getNetworkTokens, getTokenContract } from './DeployTokenService';
import { addNetwork, deployIterableNetworkMap, deployNetworkService, deployStringUtil, getNetworkContract, getNetworks } from './DeployNetworkService';
import { getOwnerAndGasPrice, getCaverAndUnlockedPublicKey } from './DeployUtils';

const conf = JSON.parse(fs.readFileSync('./value-transfer/config/deploy-bridge.json', 'utf8'));

const managerPrivateKey = conf.contractOwner.parent;
const deployRpcUrl = conf.url.parent;
const childRpcUrl = conf.url.child;
const parentBridgeAddress = conf.bridge.parent;
const childBridgeAddress = conf.bridge.child;
const childPrivateKey = conf.contractOwner.child;

async function main() {
    const { owner, gasPrice } = await getOwnerAndGasPrice(deployRpcUrl, managerPrivateKey);
    const { caver, account } = getCaverAndUnlockedPublicKey(deployRpcUrl, owner.address, managerPrivateKey);
    const contractOwner = account;

    const stringUtilAddress: string = await deployStringUtil(owner, gasPrice);
    const iterableNetworkMapAddress: string = await deployIterableNetworkMap(owner, gasPrice, stringUtilAddress);
    const deployIterableBridgeAddress = await deployIterableBridgeMap(owner, gasPrice, stringUtilAddress);

    const networkService = await deployNetworkService(owner, gasPrice, stringUtilAddress, iterableNetworkMapAddress);
    const bridgeService = await deployBridgeService(owner, gasPrice, deployIterableBridgeAddress);

    const networkContract = await getNetworkContract(caver, networkService.address, contractOwner);
    const bridgeContract = await getBridgeContract(caver, bridgeService.address, contractOwner);

    // await addMarbleXNetwork(networkContract, contractOwner, bridgeContract);
    const key = await addWalletNetwork(networkContract, contractOwner, bridgeContract);

    const childTokens = await getChildTokens();
    await updateChildBridgeTokens(deployRpcUrl, bridgeContract.options.address, managerPrivateKey, key, childBridgeAddress, childTokens);

    const networks = await getNetworks(deployRpcUrl, contractOwner, managerPrivateKey, networkContract.options.address);
    console.log('networks ', networks);

    const networkTokens = await getNetworkTokens(deployRpcUrl, contractOwner, managerPrivateKey, bridgeContract.options.address, networkContract.options.address, key);
    console.log('network tokens ', networkTokens);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const addMarbleXNetwork = async (networkContract: Contract, contractOwner: string, bridgeContract: Contract) => {
    let parentKey = "1000:MBX";
    let childKey = "1004:MBXL";
    const l1NetworkParam: NetworkParam = { chainId: '1000', shortName: 'MBX', name: 'MARBLEX', rpcUrl: deployRpcUrl, networkId: 1000 };
    const l1TokenParam: TokenParam = { symbol: 'KLAY', name: 'Klaytn Token', decimals: 18 };
    const l1Key: string = await addNetwork(networkContract, contractOwner, l1NetworkParam, l1TokenParam, childKey, '', 1);

    const l2NetworkParam: NetworkParam = { chainId: '1004', shortName: 'MBXL', name: 'MARBLEX L2', rpcUrl: childRpcUrl, networkId: 1004 };
    const l2TokenParam: TokenParam = { symbol: 'KLAYL2', name: 'Klaytn Token L2', decimals: 18 };
    const l2Key: string = await addNetwork(networkContract, contractOwner, l2NetworkParam, l2TokenParam, '', parentKey, 2);

    const bridgeParam: BridgeParam = { networkKey: l1Key, parentName: 'Parent MBX', parentBridge: parentBridgeAddress, childKey: l2Key, childName: 'Child MBXL', childBridge: childBridgeAddress };
    await addBridge(bridgeContract, contractOwner, bridgeParam);
    return l1Key;
};

const addWalletNetwork = async (networkContract: Contract, contractOwner: string, bridgeContract: Contract) => {
    let parentKey = "1000:KHW";
    let childKey = "1004:KHWL";
    const l1NetworkParam: NetworkParam = { chainId: '1000', shortName: 'KHW', name: 'H Wallet', rpcUrl: deployRpcUrl, networkId: 1000 };
    const l1TokenParam: TokenParam = { symbol: 'KLAY', name: 'Klaytn Token', decimals: 18 };
    const l1Key: string = await addNetwork(networkContract, contractOwner, l1NetworkParam, l1TokenParam, childKey, '', 1);

    const l2NetworkParam: NetworkParam = { chainId: '1004', shortName: 'KHWL', name: 'H Wallet L2', rpcUrl: childRpcUrl, networkId: 1004 };
    const l2TokenParam: TokenParam = { symbol: 'KLAYL2', name: 'Klaytn Token L2', decimals: 18 };
    const l2Key: string = await addNetwork(networkContract, contractOwner, l2NetworkParam, l2TokenParam, '', parentKey, 2);

    const bridgeParam: BridgeParam = { networkKey: l1Key, parentName: 'Parent KHW', parentBridge: parentBridgeAddress, childKey: l2Key, childName: 'Child KHWL', childBridge: childBridgeAddress };
    await addBridge(bridgeContract, contractOwner, bridgeParam);
    return l1Key;
};


const getChildTokens = async () => {
    const childOwner = await getOwnerAndGasPrice(childRpcUrl, childPrivateKey);
    const childCaver = getCaverAndUnlockedPublicKey(childRpcUrl, childOwner.owner.address, childPrivateKey);
    const childContractOwner = childCaver.account;

    const tokenService = await deployTokenService(childOwner.owner, childOwner.gasPrice);
    const tokenContract = await getTokenContract(childCaver.caver, tokenService.address, childContractOwner);

    const childTokens = await getChildBridgeTokens(tokenContract, childBridgeAddress, childContractOwner);
    return childTokens;
};
