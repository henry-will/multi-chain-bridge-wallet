// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "./ServiceApp.sol";

contract ServiceToken is ServiceApp {
	enum TokenType {ERC20, ERC721, ERC1155, KIP7, KIP17, KIP37, KLAY}
	struct Token {
		address tokenAddress;
		string tokenType;
		string name;
		string symbol;
		uint decimals;
		mapping(string => App) apps;
	}

	mapping(string => bool) public tokenTypes;
}
