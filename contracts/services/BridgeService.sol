// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IBridgeTokens.sol";
import "../interfaces/IERC20Token.sol";

import "../models/TokenModel.sol";
import "../models/BridgeModel.sol";
import "../models/NetworkKeyModel.sol";
import "../libs/IterableBridgeMap.sol";
import "./TokenService.sol";
import "./AccessControlService.sol";

contract BridgeService is TokenService, AccessControlService {
    using IterableBridgeMap for IterableBridgeMap.Map;
    IterableBridgeMap.Map private bridgePairs;

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

    function addBridgePair(
        string memory key,
        string memory parentBridgeName,
        address parentBridgeAddress,
        string memory childKey,
        string memory childBridgeName,
        address childBridgeAddress
    ) public {
        require(!bridgePairs.exist(key), string.concat(key, " already exists"));

        // add Role
        addBridgeAdminRole(key, parentBridgeAddress);

        BridgePair storage bridgePair = bridgePairs.get(key);
        bridgePair.networkKey = key;
        bridgePair.parentBridge.name = parentBridgeName;
        bridgePair.parentBridge.bridgeAddress = parentBridgeAddress;
        Token[] memory parentTokens = findRegisteredTokens(parentBridgeAddress);
        for (uint256 i = 0; i < parentTokens.length; i++) {
            bridgePair.parentBridge.registeredTokens.push(parentTokens[i]);
        }
        bridgePair.childKey = childKey;
        bridgePair.childBridge.name = childBridgeName;
        bridgePair.childBridge.bridgeAddress = childBridgeAddress;

        bridgePairs.set(key, bridgePair);
    }

    function deleteBridgePair(string memory key) public onlyServiceRole(key) {
        require(bridgePairs.exist(key), string.concat("Not Found Key ", key));
        bridgePairs.remove(key);
    }

    function updateChildBridge(
        string memory key,
        string memory childKey,
        string memory childBridgeName,
        address childBridgeAddress
    ) public onlyServiceRole(key) {
        require(bridgePairs.exist(key), string.concat("Not Found Key ", key));

        BridgePair storage bridgePair = bridgePairs.get(key);
        bridgePair.childKey = childKey;
        bridgePair.childBridge.name = childBridgeName;
        bridgePair.childBridge.bridgeAddress = childBridgeAddress;

        bridgePairs.set(key, bridgePair);
    }

    function updateParentBridge(
        string memory key,
        string memory parentBridgeName,
        address parentBridgeAddress
    ) public onlyServiceRole(key) {
        require(bridgePairs.exist(key), string.concat("Not Found Key ", key));

        BridgePair storage bridgePair = bridgePairs.get(key);
        bridgePair.parentBridge.name = parentBridgeName;
        bridgePair.parentBridge.bridgeAddress = parentBridgeAddress;
        uint256 tokenLength = bridgePair.parentBridge.registeredTokens.length;
        for (uint256 i = 0; i < tokenLength; i++) {
            bridgePair.parentBridge.registeredTokens.pop();
        }

        Token[] memory parentTokens = findRegisteredTokens(parentBridgeAddress);
        for (uint256 i = 0; i < parentTokens.length; i++) {
            bridgePair.parentBridge.registeredTokens.push(parentTokens[i]);
        }
        bridgePairs.set(key, bridgePair);
    }

    function getTokenPair(string memory key, address tokenAddress)
        external
        view
        returns (TokenPair memory)
    {
        BridgePair storage bridgePair = bridgePairs.get(key);
        uint256 parentTokenSize = bridgePair
            .parentBridge
            .registeredTokens
            .length;

        for (uint256 i = 0; i < parentTokenSize; i++) {
            if (
                bridgePair.parentBridge.registeredTokens[i].tokenAddress ==
                tokenAddress
            ) {
                return
                    TokenPair(
                        bridgePair.parentBridge.bridgeAddress,
                        bridgePair.parentBridge.registeredTokens[i],
                        bridgePair.childBridge.registeredTokens[i],
                        bridgePair.childKey
                    );
            }
        }
        revert("Not Found TokenAddress");
    }

    function getChildTokenPair(string memory key, address tokenAddress)
        external
        view
        returns (TokenPair memory)
    {
        BridgePair storage bridgePair = bridgePairs.get(key);
        uint256 childTokenSize = bridgePair.childBridge.registeredTokens.length;

        for (uint256 i = 0; i < childTokenSize; i++) {
            if (
                bridgePair.childBridge.registeredTokens[i].tokenAddress ==
                tokenAddress
            ) {
                return
                    TokenPair(
                        bridgePair.childBridge.bridgeAddress,
                        bridgePair.childBridge.registeredTokens[i],
                        bridgePair.parentBridge.registeredTokens[i],
                        bridgePair.networkKey
                    );
            }
        }
        revert("Not Found TokenAddress");
    }

    function getAllTokens(string memory key)
        public
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
    ) external onlyServiceRole(key) {
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

    function getAllBridgePairs() private view returns (BridgePair[] memory) {
        return bridgePairs.getValues();
    }

    function getKeys() private view returns (string[] memory) {
        return bridgePairs.getKeys();
    }
}
