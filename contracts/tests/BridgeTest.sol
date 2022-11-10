// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ERC20Test.sol";

contract ParentBridgeTest {
    address[] public tokens;

    constructor() {
        ERC20Test01 token01 = new ERC20Test01();
        ERC20Test02 token02 = new ERC20Test02();
        ERC721Test01 token03 = new ERC721Test01();

        tokens.push(address(token01));
        tokens.push(address(token02));
        tokens.push(address(token03));
    }

    function getRegisteredTokenList() external view returns (address[] memory) {
        return tokens;
    }
}

contract ChildBridgeTest {
    address[] public tokens;

    constructor() {
        ERC20Test03 token03 = new ERC20Test03();
        ERC20Test04 token04 = new ERC20Test04();

        tokens.push(address(token03));
        tokens.push(address(token04));
    }

    function getRegisteredTokenList() external view returns (address[] memory) {
        return tokens;
    }
}
