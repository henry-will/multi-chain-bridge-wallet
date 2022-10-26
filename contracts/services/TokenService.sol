// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 <0.9.0;

import "../../contracts/interfaces/IERC20Token.sol";
import "../../contracts/interfaces/IBridgeTokens.sol";
import "../../contracts/models/TokenModel.sol";

contract TokenService {
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
                IERC20Token tokenContract = IERC20Token(tokenAddress);

                Token memory token;
                token.tokenAddress = tokenAddress;
                token.name = tokenContract.NAME();
                token.symbol = tokenContract.SYMBOL();
                token.decimals = tokenContract.DECIMALS();
                tokens[i] = token;
            }
        }
        return tokens;
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
