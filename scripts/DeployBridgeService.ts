
import Caver, { Contract } from 'caver-js';
import { Signer, BigNumber } from 'ethers';
import fs from 'fs';
import { ethers } from 'hardhat';
import { Token, BridgeServiceJson, BridgeParam } from './DeployInterface';

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
export const updateChildBridgeTokens = async (rpcUrl: string, bridgeServiceAddress: string, operatorAccount: string, operatorPrivateKey: string, key: string, childBridge: string, tokens: Token[]) => {
    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    // Load Contract
    const bridgeServiceJson = JSON.parse(fs.readFileSync(BridgeServiceJson, 'utf8'));
    const BridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: sender, gas: 8500000 });

    const receipt = await BridgeContract.methods.addChildTokens(key, childBridge, tokens).send({ from: sender, gas: 8500000 });
    // console.log('child bridge token add', receipt);
    const bridges = await BridgeContract.methods.getAllBridgePairs().call({ from: sender, gas: 8500000 });
    console.log('child bridge', bridges[0].childBridge);
}

export const getBridgeContract = async (caver: Caver, bridgeServiceAddress: string, contractOwner: string) => {
    const bridgeServiceJson = JSON.parse(fs.readFileSync(BridgeServiceJson, 'utf8'));
    const bridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: contractOwner, gas: 8500000 });
    return bridgeContract;
}

export const addBridge = async (contract: Contract, contractOwner: string, bridge: BridgeParam) => {

    await contract.methods.addBridgePair(bridge.networkKey, bridge.parentName, bridge.parentBridge, bridge.childName, bridge.childBridge).send({
        from: contractOwner,
        gas: 8500000,
    });

};