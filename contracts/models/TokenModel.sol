// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AppModel.sol";

enum TokenType {
    ERC20,
    ERC721,
    ERC1155,
    KIP7,
    KIP17,
    KIP37,
    KLAY
}

struct Token {
    address tokenAddress;
    string tokenType;
    string name;
    string symbol;
    uint256 decimals;
    string thumbnailUri;
}

struct TokenPair {
    address bridgeAddress;
    Token token;
    Token counterpartToken;
    string counterpartKey;
}
