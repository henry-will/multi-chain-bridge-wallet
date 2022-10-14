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

    fallback() external payable {}

    // function getAllBridgePairs() external view returns (BridgePair[] memory brigePairs)
    // {
    //     return bridgePairs.getValues();
    // }

    function addBridgePair(
        string memory _name, 
        string memory _parentNetworkKey, 
        address _parentBridgeAddress,
        string memory _childNetworkKey, 
        address _childBridgeAddress ) public 
    {
        string memory _key; 
        _key = makeKey( _name, _parentNetworkKey, _childNetworkKey );
        require(!bridgePairs.exist(_key), string.concat(_key, " already exists"));

        // BridgePair storage bridgePair; 

        // bridgePair.key = _key;
        // bridgePair.name = _name;
        // bridgePair.parentNetworkKey = _parentNetworkKey; 
        // bridgePair.parentBridgeAddress = _parentBridgeAddress; 
        // bridgePair.parentBridgeTokenSize = 0; 
        // bridgePair.childNetworkKey = _childNetworkKey; 
        // bridgePair.childBridgeAddress = _childBridgeAddress; 
        // bridgePair.parentBridgeTokenSize = 0; 


        BridgePair memory bridgePair = BridgePair( 
            _key, _name, 
            _parentNetworkKey, _parentBridgeAddress, new string[](0), 0, 
            _childNetworkKey, _childBridgeAddress, new string[](0), 0
        ); 

        bridgePairs.set(_key, bridgePair);
    }


    function makeKey(
        string memory _name, 
        string memory _parentNetworkKey, 
        string memory _childNetworkKey ) public pure returns (string memory)
    {
        return string.concat( _name, ":", _parentNetworkKey, ":", _childNetworkKey );
    }



    string constant getRegisteredTokenListFunction = "getRegisteredTokenList()";
    string constant NAMEFunction = "NAME()";
    string constant SYMBOLFunction = "SYMBOL()";
    string constant DECIMALSFunction = "DECIMALS()";


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
