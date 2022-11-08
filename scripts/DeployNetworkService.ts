import Caver, { Contract } from 'caver-js';
import { Signer, BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import fs from 'fs';
import { Network, NetworkParam, NetworkServiceJson, TokenParam } from './DeployInterface';

export async function deployStringUtil(owner: Signer, gasPrice: BigNumber) {
    const StringUtil = await ethers.getContractFactory('StringUtil', { signer: owner });
    const stringUtilLib = await StringUtil.deploy({ gasPrice: gasPrice, gasLimit: 8500000 });
    await stringUtilLib.deployed();
    // console.log('#1 StringUtil ', stringUtilLib.address);
    return stringUtilLib.address;
}

export async function deployIterableNetworkMap(owner: Signer, gasPrice: BigNumber, stringUtilAddress: string) {
    const IterableNetworkMap = await ethers.getContractFactory('IterableNetworkMap', {
        signer: owner,
        libraries: {
            StringUtil: stringUtilAddress,
        },
    });
    const iterableNetworkMap = await IterableNetworkMap.deploy({ gasPrice: gasPrice, gasLimit: 8500000 });
    await iterableNetworkMap.deployed();
    // console.log('#2 IterableNetworkMap ', iterableNetworkMap.address);
    return iterableNetworkMap.address;
}

export async function deployNetworkService(owner: Signer, gasPrice: BigNumber, stringUtilAddress: string, iterableNetworkMapAddress: string) {
    const NetworkServiceFactory = await ethers.getContractFactory('NetworkService', {
        signer: owner,
        libraries: {
            StringUtil: stringUtilAddress,
            IterableNetworkMap: iterableNetworkMapAddress
        }
    });

    const networkService = await NetworkServiceFactory.deploy({ gasPrice: gasPrice, gasLimit: 8500000 });
    await networkService.deployed();
    console.log('## NetworkService ', networkService.address);

    // const networkOwner = await networkService.owner();
    // console.log('#3 NetworkService owner', networkOwner);

    return networkService;
}

export const getNetworks = async (rpcUrl: string, operatorAccount: string, operatorPrivateKey: string, networkServiceAddress: string) => {
    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    // Load Contract
    const networkServiceJson = JSON.parse(fs.readFileSync(NetworkServiceJson, 'utf8'));
    const NetworkContract = caver.contract.create(networkServiceJson.abi, networkServiceAddress, { from: sender, gas: 8500000 });
    const networks = await NetworkContract.methods.getAllNetworks().call({ from: sender, gas: 8500000 });

    let networkArray: Array<Network> = [];
    for (let i = 0; i < networks.length; i++) {
        networkArray.push(new Network(networks[i].key, networks[i].chainId, networks[i].name, networks[i].rpcUrl, networks[i].networkId));
    }

    return networkArray;
};

export const getNetworkContract = async (caver: Caver, networkServiceAddress: string, contractOwner: string) => {
    const networkServiceJson = JSON.parse(fs.readFileSync(NetworkServiceJson, 'utf8'));
    const networkContract = caver.contract.create(networkServiceJson.abi, networkServiceAddress, { from: contractOwner, gas: 8500000 });
    return networkContract;
}

export const addNetwork = async (contract: Contract, contractOwner: string, network: NetworkParam, token: TokenParam) => {

    await contract.methods.addNetwork(network.chainId, network.shortName, network.name, network.rpcUrl, network.networkId, token.name, token.symbol, token.decimals).send({
        from: contractOwner,
        gas: 8500000,
    });
    const key = await contract.methods.getKey(network.chainId, network.shortName).call();
    console.log('Network key is ', key);
    return key;
};