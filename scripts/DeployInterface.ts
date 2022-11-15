export interface NetworkParam {
    chainId: string;
    shortName: string;
    name: string;
    rpcUrl: string;
    networkId: Number;
}

export interface TokenParam {
    name: string;
    symbol: string;
    decimals: Number;
    thumbnailUri?: string;
    tokenType?: string;
}

export interface BridgeParam {
    networkKey: string;
    parentName: string;
    parentBridge: string;
    childKey: string;
    childName: string;
    childBridge: string;
}

export class Network {
    key: string;
    chainId: string;
    name: string;
    rpcUrl: string;
    networkId: Number;

    constructor(key: string, chainId: string, name: string, rpcUrld: string, networkId: Number) {
        this.key = key;
        this.chainId = chainId;
        this.name = name;
        this.rpcUrl = rpcUrld;
        this.networkId = networkId;
    }
}

export class NetworkToken {
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

export class Token {
    tokenAddress: string;
    tokenType: string;

    name: string;
    symbol: string;
    decimals: Number;
    thumbnailUri: string;
    constructor(tokenAddress: string, tokenType: string, name: string, symbol: string, decimals: Number, thumbnailUri: string) {
        this.tokenAddress = tokenAddress;
        this.tokenType = tokenType;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
        this.thumbnailUri = thumbnailUri;
    }
}

export const TokenServiceJson = './artifacts/contracts/services/TokenService.sol/TokenService.json';
export const BridgeServiceJson = './artifacts/contracts/services/BridgeService.sol/BridgeService.json';
export const NetworkServiceJson = './artifacts/contracts/services/NetworkService.sol/NetworkService.json';