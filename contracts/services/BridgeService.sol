// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "../interfaces/IBridgeTokens.sol";
import "../interfaces/IERC20Token.sol";

import "../models/TokenModel.sol";
import "../models/BridgeModel.sol";
import "../models/NetworkKeyModel.sol";
import "../libs/IterableBridgeMap.sol";
import "./TokenService.sol";

contract BridgeService is TokenService {
    using IterableBridgeMap for IterableBridgeMap.Map;
    IterableBridgeMap.Map private bridgePairs;

    receive() external payable {}

    fallback() external payable {}

    function getAllBridgePairs()
        external
        view
        returns (BridgePair[] memory bridgePairs)
    {
        return bridgePairs.getValues();
    }

    function size() public view returns (uint256) {
        return bridgePairs.size();
    }

    function getBridgePair(string memory key)
        public
        view
        returns (BridgePair memory)
    {
        return bridgePairs.get(key);
    }

    function getKeys() external view returns (string[] memory) {
        return bridgePairs.getKeys();
    }

    function addBridgePair(
        string memory key,
        string memory parentBridgeName,
        address parentBridgeAddress,
        string memory childBridgeName,
        address childBridgeAddress
    ) public {
        require(!bridgePairs.exist(key), string.concat(key, " already exists"));

        BridgePair storage bridgePair = bridgePairs.get(key);
        bridgePair.networkKey = key;
        bridgePair.parentBridge.name = parentBridgeName;
        bridgePair.parentBridge.bridgeAddress = parentBridgeAddress;
        // Token[] memory parentTokens = getTokens(parentBridgeAddress);
        // for (uint256 i = 0; i < parentTokens.length; i++) {
        //     bridgePair.parentBridge.registeredTokens.push(parentTokens[i]);
        // }
        bridgePair.childBridge.name = childBridgeName;
        bridgePair.childBridge.bridgeAddress = childBridgeAddress;
        // Token[] memory childTokens = getTokens(childBridgeAddress);
        // for (uint256 i = 0; i < childTokens.length; i++) {
        //     bridgePair.childBridge.registeredTokens.push(childTokens[i]);
        // }

        bridgePairs.set(key, bridgePair);
    }

    function getAllTokens(string memory key)
        external
        view
        returns (Token[] memory)
    {
        BridgePair storage bridgePair = bridgePairs.get(key);
        Token[] storage parentTokens = bridgePair.parentBridge.registeredTokens;
        Token[] storage childTokens = bridgePair.childBridge.registeredTokens;
        uint256 parentTokenSize = parentTokens.length;
        uint256 childTokenSize = childTokens.length;
        Token[] memory tokens = new Token[](parentTokenSize + childTokenSize);
        for (uint256 i = 0; i < parentTokenSize; i++) {
            tokens[i] = parentTokens[i];
        }
        for (uint256 i = 0; i < childTokenSize; i++) {
            tokens[parentTokenSize + i] = childTokens[i];
        }
        return tokens;
    }

    function addChildTokens(
        string memory key,
        address childBridgeAddress,
        Token[] memory tokens
    ) external {
        BridgePair storage bridgePair = bridgePairs.get(key);
        require(bytes(bridgePair.networkKey).length > 0, "NOT Found Key");

        require(
            childBridgeAddress == bridgePair.childBridge.bridgeAddress,
            "Not Found Child Bridge"
        );

        for (uint256 i = 0; i < tokens.length; i++) {
            bridgePair.childBridge.registeredTokens.push(tokens[i]);
        }
    }
}
