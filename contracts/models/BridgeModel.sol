// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 <0.9.0;

import "./TokenModel.sol";

struct BridgePair {
    // BridgePair's key made by parentNetworkKey + childNetworkKey + name
    string key;
    string name;

    // parent bridge info 
    string parentNetworkKey;
    address parentBridgeAddress;
    // mapping(uint => Token) parentBridgeTokens; 
    // uint parentBridgeTokenSize;  
    address[] parentBridgeTokenAddress;
    string[] parentBridgeTokenType;
    string[] parentBridgeTokenName;
    string[] parentBridgeTokenSymbol;
    uint256[] parentBridgeTokenDecimals;


    // child bridge info 
    string childNetworkKey;
    address childBridgeAddress;
    // mapping(uint => Token) childrenBridgeTokens; 
    // uint childBridgeTokenSize; 
    address[] childBridgeTokenAddress;
    string[] childBridgeTokenType;
    string[] childBridgeTokenName;
    string[] childBridgeTokenSymbol;
    uint256[] childBridgeTokenDecimals;
}
