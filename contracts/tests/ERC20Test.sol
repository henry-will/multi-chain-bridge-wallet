// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract ERC20Test01 {
    string public constant NAME = "Parent ServiceChainToken 01";
    string public constant SYMBOL = "PSCT01";
    uint8 public constant DECIMALS = 18;
}

contract ERC20Test02 {
    string public constant NAME = "Parent ServiceChainToken 02";
    string public constant SYMBOL = "PSCT02";
    uint8 public constant DECIMALS = 9;
}

contract ERC20Test03 {
    string public constant NAME = "Child ServiceChainToken 03";
    string public constant SYMBOL = "CSCT03";
    uint8 public constant DECIMALS = 1;
}
contract ERC20Test04 {
    string public constant NAME = "Child ServiceChainToken 04";
    string public constant SYMBOL = "CSCT04";
    uint8 public constant DECIMALS = 12;
}