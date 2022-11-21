// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../../contracts/interfaces/IERC20Token.sol";
import "../../contracts/interfaces/IERC721Token.sol";
import "../../contracts/interfaces/IBridgeTokens.sol";
import "../../contracts/models/TokenModel.sol";
import "../../contracts/services/TokenService.sol";

import "./BridgeTest.sol";
import "./ERC20Test.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract TokenListCallTest is TokenService {
    using ERC165Checker for address;
    Token[] registeredTokens;

    function registered() public {
        ParentBridgeTest parentTest = new ParentBridgeTest();
        address parent = address(parentTest);
        Token[] memory tokens = getTokens(parent);
        for (uint256 i = 0; i < tokens.length; i++) {
            registeredTokens.push(tokens[i]);
        }

        // ChildBridgeTest childTest = new ChildBridgeTest();
        // address a = address(childTest);
    }

    function findTokenList() public view returns (Token[] memory) {
        return registeredTokens;
    }
}
