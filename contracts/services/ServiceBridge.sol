// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IBridgeTokens.sol";
import "../interfaces/IERC20Token.sol";

import "../models/TokenModel.sol";
import "../models/BridgeModel.sol";
import "../models/NetworkKeyModel.sol";
import "../libs/IterableBridgeMap.sol";

contract ServiceBridge {
    using IterableBridgeMap for IterableBridgeMap.Map;
    IterableBridgeMap.Map private bridgePairs;

    receive() external payable {}

    function getAllBridgePairs()
        external
        view
        returns (BridgePair[] memory brigePairs)
    {
        return bridgePairs.getValues();
    }

    function addBridgePair(
        string memory key,
        string memory parentBridgeName,
        address parentBridgeAddress,
        string memory childBridgeName,
        address childBridgeAddress
    ) public {
        require(!bridgePairs.exist(key), string.concat(key, " already exists"));

        BridgePair memory bridgePair;

        bridgePair.networkKey = key;
        bridgePair.parentBridge = makeBridge(
            parentBridgeName,
            parentBridgeAddress
        );
        bridgePair.childBridge = makeBridge(
            childBridgeName,
            childBridgeAddress
        );

        bridgePairs.set(key, bridgePair);
    }

    function makeBridge(string memory name, address bridgeAddress)
        private
        pure
        returns (Bridge memory)
    {
        Bridge memory bridge;
        bridge.name = name;
        bridge.bridgeAddress = bridgeAddress;
        return bridge;
    }

    string constant getRegisteredTokenListFunction = "getRegisteredTokenList()";
    string constant NAMEFunction = "NAME()";
    string constant SYMBOLFunction = "SYMBOL()";
    string constant DECIMALSFunction = "DECIMALS()";

    fallback() external payable {}

    function findTokenAddressListBySignature(address bridgeAddress)
        public
        returns (address[] memory)
    {
        bytes memory payload = abi.encodeWithSignature(
            getRegisteredTokenListFunction
        );
        (bool success, bytes memory returnData) = address(bridgeAddress).call(
            payload
        );
        require(success);

        address[] memory tokenList = abi.decode(returnData, (address[]));
        return tokenList;
    }
}
