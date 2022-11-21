// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract ERC20Test01 {
    string public name = "Parent ServiceChainToken 01";
    string public symbol = "PSCT01";
    uint8 public decimals = 18;

    receive() external payable {}
}

contract ERC20Test02 {
    string public name = "Parent ServiceChainToken 02";
    string public symbol = "PSCT02";
    uint8 public decimals = 9;

    receive() external payable {}
}

contract ERC20Test03 {
    string public name = "Child ServiceChainToken 03";
    string public symbol = "CSCT03";
    uint8 public decimals = 1;

    receive() external payable {}
}

contract ERC20Test04 {
    string public name = "Child ServiceChainToken 04";
    string public symbol = "CSCT04";
    uint8 public decimals = 12;

    receive() external payable {}
}

contract ERC721Test01 is ERC165Storage {
    string public name = "Child NFT 01";
    string public symbol = "CNT01";
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    constructor() {
        _registerInterface(_INTERFACE_ID_ERC721);
    }

    receive() external payable {}

    fallback() external payable {}
}
