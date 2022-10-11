// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

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
    string key;
    string name;
    string symbol;
    address tokenAddress;
    string tokenType;
    uint256 decimals;
    App apps;
}
