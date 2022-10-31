// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "./AppModel.sol";

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
    TokenType tokenType;  // 식별방법? 배포 후에 식별자...
    // https://stackoverflow.com/questions/45364197/how-to-detect-if-an-ethereum-address-is-an-erc20-token-contract

    // IERC20Token feature
    string name;
    string symbol;
    uint256 decimals;

    // App apps;
}
