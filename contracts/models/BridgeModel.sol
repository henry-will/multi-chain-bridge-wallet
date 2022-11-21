// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenModel.sol";

struct BridgePair {
    string networkKey;
    Bridge parentBridge;
    string childKey;
    Bridge childBridge;
}

struct Bridge {
    string name;
    address bridgeAddress;
    bool depth;
    Token[] registeredTokens;
}
