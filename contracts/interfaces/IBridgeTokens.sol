// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBridgeTokens {
    function getRegisteredTokenList() external view returns (address[] memory);
}
