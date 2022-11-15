
import Caver, { Contract } from 'caver-js';
import { Signer, BigNumber } from 'ethers';
import fs from 'fs';
import { ethers } from 'hardhat';
import { Token, BridgeServiceJson, BridgeParam } from './DeployInterface';
import { getOwnerAndGasPrice, getCaverAndUnlockedPublicKey } from './DeployUtils';

export async function deployIterableBridgeMap(owner: Signer, gasPrice: BigNumber, stringUtilAddress: string) {
    const IterableBridgeMap = await ethers.getContractFactory('IterableBridgeMap', {
        signer: owner,
        libraries: {
            StringUtil: stringUtilAddress,
        },
    });
    const iterableBridgeMapLib = await IterableBridgeMap.deploy({ gasPrice: gasPrice, gasLimit: 8500000 });
    await iterableBridgeMapLib.deployed();
    return iterableBridgeMapLib.address;
}

export async function deployBridgeService(owner: Signer, gasPrice: BigNumber, iterableBridgeMapAddress: string) {
    const BridgeService = await ethers.getContractFactory('BridgeService', {
        signer: owner,
        libraries: {
            IterableBridgeMap: iterableBridgeMapAddress,
        }
    });
    const bridgeService = await BridgeService.deploy({ gasPrice: gasPrice, gasLimit: 8500000 });
    await bridgeService.deployed();
    console.log('## BridgeService ', bridgeService.address);
    return bridgeService;
}

export const updateChildBridgeTokens = async (rpcUrl: string, bridgeServiceAddress: string, operatorPrivateKey: string, key: string, childBridge: string, tokens: Token[]) => {
    const { owner, gasPrice } = await getOwnerAndGasPrice(rpcUrl, operatorPrivateKey);
    const { caver, account } = getCaverAndUnlockedPublicKey(rpcUrl, owner.address, operatorPrivateKey);
    const sender = account;

    // Load Contract
    const bridgeServiceJson = JSON.parse(fs.readFileSync(BridgeServiceJson, 'utf8'));
    const bridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: sender, gas: 8500000 });

    // const bridgePair = await BridgeContract.methods.getBridgePair(key).call({ from: sender, gas: 8500000 });
    // console.log('bridge', bridgePair);
    const receipt = await bridgeContract.methods.addChildTokens(key, childBridge, tokens).send({ from: sender, gas: 8500000 });
    // console.log('child bridge token add', receipt);
}

export const getBridgeContract = async (caver: Caver, bridgeServiceAddress: string, contractOwner: string) => {
    const bridgeServiceJson = JSON.parse(fs.readFileSync(BridgeServiceJson, 'utf8'));
    const bridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: contractOwner, gas: 8500000 });
    return bridgeContract;
}

export const addBridge = async (contract: Contract, contractOwner: string, bridge: BridgeParam) => {

    await contract.methods.addBridgePair(bridge.networkKey, bridge.parentName, bridge.parentBridge, bridge.childKey, bridge.childName, bridge.childBridge).send({
        from: contractOwner,
        gas: 8500000,
    });

};