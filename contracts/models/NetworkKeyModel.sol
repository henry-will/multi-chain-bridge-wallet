// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract NetworkKeyModel {
    struct NetworkKey {
        string chainId;
        string shortName;
    }

    function getKey(string memory chainId, string memory shortName)
        public
        pure
        returns (string memory key)
    {
        return makeKey(NetworkKey(chainId, shortName));
    }

    function makeKey(NetworkKey memory key)
        internal
        pure
        returns (string memory)
    {
        return string.concat(key.chainId, ":", key.shortName);
    }
}
