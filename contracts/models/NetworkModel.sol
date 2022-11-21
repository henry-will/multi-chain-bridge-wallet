// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenModel.sol";

/// @notice Network is a information of chain node
struct Network {
    string key;
    string chainId;
    string shortName;
    string name;
    string rpcUrl;
    uint256 networkId;
    NativeCurrency nativeCurrency;
    Token token;
    string explorer;
    string description;
    string website;
    string childKey;
    string parentKey;
    uint8 layer;
    NetworkDetail detail;
}

struct NativeCurrency {
    string name;
    string symbol;
    uint256 decimals;
}

struct NetworkDetail {
    bool activated;
    bool show;
    uint256 displayOrder;
    bool networkStatus;
    uint256 lastCheckedNetworkStatus;
}
