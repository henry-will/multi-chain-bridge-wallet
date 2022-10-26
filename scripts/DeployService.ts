import { ethers } from 'hardhat';
import Caver from 'caver-js';
import fs from 'fs';

async function main() {
    const operatorPrivateKey = '0x1dd4dc19688dde6b519f3d305349fa7cbc6f5c4195e72e0d12b665b2bc39a3a1';
    const operatorAccount = '0x25c274e622c4deb1dcfa211e75b7b4671cdb0db2';

    const caver = new Caver('http://127.0.0.1:8451');
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8451');
    const owner = new ethers.Wallet(operatorPrivateKey, provider)

    // Deploy Libraries
    const StringUtil = await ethers.getContractFactory('StringUtil', { signer: owner });
    const stringUtilLib = await StringUtil.deploy({ gasPrice: 0, gasLimit: 85000000 });
    await stringUtilLib.deployed();
    console.log('#1 StringUtil ', stringUtilLib.address);

    const IterableNetworkMap = await ethers.getContractFactory('IterableNetworkMap', {
        signer: owner,
        libraries: {
            StringUtil: stringUtilLib.address,
        },
    });
    const iterableNetworkMap = await IterableNetworkMap.deploy({ gasPrice: 0, gasLimit: 85000000 });
    await iterableNetworkMap.deployed();
    console.log('#2 IterableNetworkMap ', iterableNetworkMap.address);

    // Deploy NetworkService
    const NetworkServiceFactory = await ethers.getContractFactory('NetworkService', {
        signer: owner,
        libraries: {
            StringUtil: stringUtilLib.address,
            IterableNetworkMap: iterableNetworkMap.address,
        }
    });

    const networkService = await NetworkServiceFactory.deploy({ gasPrice: 0, gasLimit: 85000000 });
    await networkService.deployed();
    console.log('#3 NetworkService ', networkService.address);
    const networkOwner = await networkService.owner();
    console.log('#3 NetworkService owner', networkOwner);

    // Add Network
    console.log(`Service Network owner ${sender}`);
    const chainId = '1004';
    const shortName = 'HT';

    // // const NetworkService = NetworkServiceFactory.attach(networkService.address);

    // await networkService.addNetwork(chainId, shortName, 'Henry Test', 'http://127.0.0.1:8351', 9999, 'Henry Token', 'HRT', 18, {
    //     from: sender,
    //     gasPrice: 0,
    //     gasLimit: 85000000
    // });

    const networkServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/NetworkService.sol/NetworkService.json', 'utf8'));
    // Deploy Contract by caver-js
    // const networkService = caver.contract.create(networkServiceJson.abi);
    // console.log('#3 NetworkService ', networkService.options.address);

    // const NetworkServ = await networkService.deploy({ from: sender, gas: 8500000 }, NetworkServiceFactory.bytecode);
    // console.log('#10 ', NetworkServ.options.address);

    const NetworkContract = caver.contract.create(networkServiceJson.abi, networkService.address, { from: sender, gas: 8500000 });
    console.log('#11 NetworkContract ', NetworkContract.options.address);

    await NetworkContract.methods.addNetwork(chainId, shortName, 'Henry Test', 'http://127.0.0.1:8351', 9999, 'Henry Token', 'HRT', 18).send({
        from: sender,
        gas: 8500000,
    });

    const key = await NetworkContract.methods.getKey(chainId, shortName).call();
    console.log('key is ', key);
    const size = await NetworkContract.methods.size().call({ from: sender, gas: 8500000 });
    console.log('size is ', size);

    const allKeys = await NetworkContract.methods.getKeys().call({ from: sender, gas: 8500000 });
    console.log(`Service Networks keys ${JSON.stringify(allKeys)}`);

    const allNetworks = await NetworkContract.methods.getAllNetworks().call({ from: sender, gas: 8500000 });
    console.log(`Service Networks ${JSON.stringify(allNetworks)}`);


    // Deploy Bridge
    const IterableBridgeMap = await ethers.getContractFactory('IterableBridgeMap', {
        signer: owner,
        libraries: {
            StringUtil: stringUtilLib.address,
        },
    });
    const iterableBridgeMapLib = await IterableBridgeMap.deploy({ gasPrice: 0, gasLimit: 85000000 });
    await iterableBridgeMapLib.deployed();


    const BridgeService = await ethers.getContractFactory('BridgeService', {
        signer: owner,
        libraries: {
            IterableBridgeMap: iterableBridgeMapLib.address,
        }
    });
    const bridgeService = await BridgeService.deploy({ gasPrice: 0, gasLimit: 85000000 });
    await bridgeService.deployed();

    // Load Contract
    const bridgeServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/BridgeService.sol/BridgeService.json', 'utf8'));
    const BridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeService.address, { from: sender, gas: 8500000 });
    console.log('#12 BridgeContract ', BridgeContract.options.address);

    const childBridgeAddress = '0x1C92b4a44f23881E3aCD89339f5Cd4B6a9Fa763A';

    const receipt = await BridgeContract.methods.addBridgePair(key, 'parent henry', '0xc5e670644c167aCEFf44A236b91146390DD2f584', 'child henry', childBridgeAddress).send({
        from: sender,
        gas: 8500000,
    });
    // console.log('receipt', receipt);

    const size2 = await BridgeContract.methods.size().call({ from: sender, gas: 8500000 });
    console.log('size is ', size2);

    const allKeys2 = await BridgeContract.methods.getKeys().call({ from: sender, gas: 8500000 });
    console.log(`Service Bridge keys ${JSON.stringify(allKeys2)}`);

    const bridges = await BridgeContract.methods.getAllBridgePairs().call({ from: sender, gas: 8500000 });
    // console.log('parent bridge', bridges[0].parentBridge);
    // console.log('parent bridge tokens', bridges[0].parentBridge.registeredTokens);

    const childTokens = await getChildBridgeTokens('http://127.0.0.1:8351', '0x7c24f4decc7a59f915d370faf89c63519e99bfcf', '0x6a98c76bae11151c5d74f9a007fdf689a7ca8aa3a78b1268fddf6d5df5348cf1', childBridgeAddress)
    console.log('child tokens ', childTokens);

    // Add child tokens
    await updateChildBridgeTokens('http://127.0.0.1:8451', BridgeContract.options.address, operatorAccount, operatorPrivateKey, key, childBridgeAddress, childTokens);

    const networks = await getNetworks('http://127.0.0.1:8451', operatorAccount, operatorPrivateKey, NetworkContract.options.address);
    console.log('networks ', networks);

    const networkTokens = await getNetworkTokens('http://127.0.0.1:8451', operatorAccount, operatorPrivateKey, BridgeContract.options.address, NetworkContract.options.address, key);
    console.log('networks ', networkTokens);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

class Network {
    key: string;
    chainId: string;
    name: string;
    rpcUrl: string;
    networkId: Number;

    constructor(key: string, chainId: string, namec: string, rpcUrld: string, networkId: Number) {
        this.key = key;
        this.chainId = chainId;
        this.name = namec;
        this.rpcUrl = rpcUrld;
        this.networkId = networkId;
    }
}

class NetworkToken {
    tokenAddress: string;
    tokenType: string;
    name: string;
    symbol: string;
    decimals: Number;
    layer: Number;
    constructor(tokenAddress: string, tokenType: string, name: string, symbol: string, decimals: Number, layer: Number) {
        this.tokenAddress = tokenAddress;
        this.tokenType = tokenType;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
        this.layer = layer;
    }
}

class Token {
    tokenAddress: string;
    tokenType: string;

    name: string;
    symbol: string;
    decimals: Number;
    constructor(tokenAddress: string, tokenType: string, name: string, symbol: string, decimals: Number) {
        this.tokenAddress = tokenAddress;
        this.tokenType = tokenType;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
    }
}

async function getNetworkTokens(rpcUrl: string, operatorAccount: string, operatorPrivateKey: string, bridgeServiceAddress: string, networkServiceAddress: string, key: string) {
    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    // Load Contract
    const networkServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/NetworkService.sol/NetworkService.json', 'utf8'));
    const NetworkContract = caver.contract.create(networkServiceJson.abi, networkServiceAddress, { from: sender, gas: 8500000 });
    const network = await NetworkContract.methods.getNetwork(key).call({ from: sender, gas: 8500000 });

    const bridgeServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/BridgeService.sol/BridgeService.json', 'utf8'));
    const BridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: sender, gas: 8500000 });
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

async function getNetworks(rpcUrl: string, operatorAccount: string, operatorPrivateKey: string, networkServiceAddress: string) {
    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    // Load Contract
    const networkServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/NetworkService.sol/NetworkService.json', 'utf8'));
    const NetworkContract = caver.contract.create(networkServiceJson.abi, networkServiceAddress, { from: sender, gas: 8500000 });
    const networks = await NetworkContract.methods.getAllNetworks().call({ from: sender, gas: 8500000 });

    let networkArray: Array<Network> = [];
    for (let i = 0; i < networks.length; i++) {
        networkArray.push(new Network(networks[i].key, networks[i].chainId, networks[i].name, networks[i].rpcUrl, networks[i].networkId));
    }

    return networkArray;
}

async function getChildBridgeTokens(rpcUrl: string, operatorAccount: string, operatorPrivateKey: string, childBridge: string) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const owner = new ethers.Wallet(operatorPrivateKey, provider)

    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    const TokenService = await ethers.getContractFactory('TokenService', {
        signer: owner
    });
    const tokenService = await TokenService.deploy({ gasPrice: 25000000000, gasLimit: 85000000 });
    await tokenService.deployed();

    // Load Contract
    const tokenServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/TokenService.sol/TokenService.json', 'utf8'));
    const TokenContract = caver.contract.create(tokenServiceJson.abi, tokenService.address, { from: sender, gas: 8500000 });

    console.log('# Token Service ', TokenContract.options.address);

    const tokens = await TokenContract.methods.getTokens(childBridge).call({ from: sender, gas: 8500000 });

    let tokenArray: Array<Token> = [];
    for (let i = 0; i < tokens.length; i++) {
        tokenArray.push(new Token(tokens[i].tokenAddress, tokens[i].tokenType, tokens[i].name, tokens[i].symbol, tokens[i].decimals));
    }

    return tokenArray;
}

async function updateChildBridgeTokens(rpcUrl: string, bridgeServiceAddress: string, operatorAccount: string, operatorPrivateKey: string, key: string, childBridge: string, tokens: Token[]) {
    const caver = new Caver(rpcUrl);
    const keyring = new caver.wallet.keyring.singleKeyring(operatorAccount, operatorPrivateKey);
    const sender = caver.wallet.add(keyring).address;

    // Load Contract
    const bridgeServiceJson = JSON.parse(fs.readFileSync('./artifacts/contracts/services/BridgeService.sol/BridgeService.json', 'utf8'));
    const BridgeContract = caver.contract.create(bridgeServiceJson.abi, bridgeServiceAddress, { from: sender, gas: 8500000 });

    const receipt = await BridgeContract.methods.addChildTokens(key, childBridge, tokens).send({ from: sender, gas: 8500000 });
    // console.log('child bridge token add', receipt);
    const bridges = await BridgeContract.methods.getAllBridgePairs().call({ from: sender, gas: 8500000 });
    console.log('child bridge', bridges[0].childBridge);
}
