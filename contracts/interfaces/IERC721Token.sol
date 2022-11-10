// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IERC721Token {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function tokenURI() external view returns (string memory);
}
