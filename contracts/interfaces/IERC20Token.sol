// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IERC20Token {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);
}

interface IERC20TokenByCapital {
    function NAME() external view returns (string memory);

    function SYMBOL() external view returns (string memory);

    function DECIMALS() external view returns (uint8);
}
