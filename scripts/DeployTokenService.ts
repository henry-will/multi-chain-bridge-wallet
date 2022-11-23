import { ethers } from 'hardhat';
import Caver, { Contract } from 'caver-js';
import fs from 'fs';
import { TokenServiceJson, Token, BridgeServiceJson, NetworkServiceJson, NetworkToken } from './DeployInterface';
import { Signer, BigNumber } from 'ethers';

export async function deployTokenService(owner: Signer, gasPrice: BigNumber) {
    const TokenService = await ethers.getContractFactory('TokenService', {
        signer: owner
    });
    const tokenService = await TokenService.deploy({ gasPrice: gasPrice, gasLimit: 8500000 });
    await tokenService.deployed();

    console.log('## Token Service ', tokenService.address);
    return tokenService;
}

export const getTokenContract = async (caver: Caver, tokenServiceAddress: string, contractOwner: string) => {
    const tokenServiceJson = JSON.parse(fs.readFileSync(TokenServiceJson, 'utf8'));
    const tokenContract = caver.contract.create(tokenServiceJson.abi, tokenServiceAddress, { from: contractOwner, gas: 8500000 });
    return tokenContract;
}

export const getChildBridgeTokens = async (tokenContract: Contract, childBridge: string, contractOwner: string) => {

    // Load Contract
    const tokens = await tokenContract.methods.findRegisteredTokens(childBridge).call({ from: contractOwner, gas: 8500000 });
    // console.log(`Tokens ${tokens}`);

    let tokenArray: Array<Token> = [];
    for (let i = 0; i < tokens.length; i++) {
        tokenArray.push(new Token(tokens[i].tokenAddress, tokens[i].tokenType, tokens[i].name, tokens[i].symbol, tokens[i].decimals, tokens[i].thumbnailUri));
    }

    console.log('child tokens ', tokenArray);
    return tokenArray;
};

export const getNetworkTokens = async (rpcUrl: string, operatorAccount: string, operatorPrivateKey: string, bridgeServiceAddress: string, networkServiceAddress: string, key: string) => {
    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    // Load Contract
    const networkServiceJson = JSON.parse(fs.readFileSync(NetworkServiceJson, 'utf8'));
    const NetworkContract = caver.contract.create(networkServiceJson.abi, networkServiceAddress, { from: sender, gas: 8500000 });
    const network = await NetworkContract.methods.getNetwork(key).call({ from: sender, gas: 8500000 });

    const bridgeServiceJson = JSON.parse(fs.readFileSync(BridgeServiceJson, 'utf8'));
    const BridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: sender, gas: 8500000 });
    console.log('Bridge Contract', BridgeContract.options.address);
    const bridgePair = await BridgeContract.methods.getBridgePair(key).call({ from: sender, gas: 8500000 });

    let networkTokenArray: Array<NetworkToken> = [];
    const parentTokens = bridgePair.parentBridge.registeredTokens;
    for (let i = 0; i < parentTokens.length; i++) {
        const token = parentTokens[i];
        networkTokenArray.push(new NetworkToken(token.tokenAddress, token.tokenType, token.name, token.symbol, token.decimals, 1));
    }

    const childTokens = bridgePair.childBridge.registeredTokens;
    for (let i = 0; i < childTokens.length; i++) {
        const token = childTokens[i];
        networkTokenArray.push(new NetworkToken(token.tokenAddress, token.tokenType, token.name, token.symbol, token.decimals, 2));
    }

    return networkTokenArray;
}