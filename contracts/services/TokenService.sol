// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../contracts/interfaces/IERC20Token.sol";
import "../../contracts/interfaces/IERC721Token.sol";
import "../../contracts/interfaces/IBridgeTokens.sol";
import "../../contracts/models/TokenModel.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract TokenService {
    using ERC165Checker for address;
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    function getTokens(address bridgeAddress)
        public
        view
        returns (Token[] memory)
    {
        if (!existContract(bridgeAddress)) {
            return new Token[](0);
        }

        address[] memory tokenContracts = IBridgeTokens(bridgeAddress)
            .getRegisteredTokenList();
        Token[] memory tokens = new Token[](tokenContracts.length);
        for (uint256 i = 0; i < tokenContracts.length; i++) {
            address tokenAddress = tokenContracts[i];
            if (existContract(tokenAddress)) {
                tokens[i] = findToken(tokenAddress);
                tokens[i].tokenAddress = tokenAddress;
            }
        }
        return tokens;
    }

    function findToken(address tokenAddress)
        public
        view
        returns (Token memory)
    {
        Token memory token = findERC721Token(tokenAddress);
        if (token.tokenAddress != address(0)) {
            return token;
        }
        return findERC20Token(tokenAddress);
    }

    function findERC20Token(address tokenAddress)
        public
        view
        returns (Token memory)
    {
        Token memory token;
        IERC20Token tokenContract = IERC20Token(tokenAddress);
        token.tokenAddress = tokenAddress;
        token.tokenType = getTokenType(TokenType.ERC20);
        token.name = tokenContract.name();
        token.symbol = tokenContract.symbol();
        token.decimals = tokenContract.decimals();
        return token;
    }

    function findERC721Token(address tokenAddress)
        public
        view
        returns (Token memory)
    {
        Token memory token;
        if (tokenAddress.supportsInterface(_INTERFACE_ID_ERC721)) {
            IERC721Token tokenContract = IERC721Token(tokenAddress);
            token.tokenAddress = tokenAddress;
            token.tokenType = getTokenType(TokenType.ERC721);
            token.name = tokenContract.name();
            token.symbol = tokenContract.symbol();
        }
        return token;
    }

    function getTokenType(TokenType tokenType)
        public
        pure
        returns (string memory)
    {
        if (TokenType.ERC20 == tokenType) return "ERC20";
        if (TokenType.ERC721 == tokenType) return "ERC721";
        if (TokenType.ERC1155 == tokenType) return "ERC1155";
        if (TokenType.KIP7 == tokenType) return "KIP7";
        if (TokenType.KIP17 == tokenType) return "KIP17";
        if (TokenType.KIP37 == tokenType) return "KIP37";
        if (TokenType.KLAY == tokenType) return "KLAY";
        return "";
    }

    function existContract(address contractAddress)
        private
        view
        returns (bool)
    {
        uint256 contractSize;

        assembly {
            contractSize := extcodesize(contractAddress)
        }
        return contractSize != 0;
    }
}
