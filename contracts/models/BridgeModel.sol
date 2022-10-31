// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 <0.9.0;

import "./TokenModel.sol";

struct BridgePair {
    // BridgePair's key made by parentNetworkKey + childNetworkKey + name
    string key;
    string name;

    // parent bridge info 
    string parentNetwork;
    address parentBridgeAddress;
    // mapping(uint => Token) parentBridgeTokens; 
    uint256 parentBridgeTokenSize;  
    address[] parentBridgeTokenAddress;
    TokenType[] parentBridgeTokenType;
    string[] parentBridgeTokenName;
    string[] parentBridgeTokenSymbol;
    uint256[] parentBridgeTokenDecimals;


    // child bridge info 
    string childNetwork;
    address childBridgeAddress;
    // mapping(uint => Token) childrenBridgeTokens; 
    uint256 childBridgeTokenSize; 
    address[] childBridgeTokenAddress;
    TokenType[] childBridgeTokenType;
    string[] childBridgeTokenName;
    string[] childBridgeTokenSymbol;
    uint256[] childBridgeTokenDecimals;

    // struct 구조로 바꾸도록 개선... 
}
