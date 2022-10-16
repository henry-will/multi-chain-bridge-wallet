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

        // parentBridge Token list update
        // address parentBridge = address(_parentBridgeAddress);
        // IBridgeTokens iBridgeTokens = IBridgeTokens(parentBridge);
        // address[] memory tokenContracts = iBridgeTokens.getRegisteredTokenList();

        // address[] memory _pTokenAddress = new address[](tokenContracts.length); 
        // string[] memory _pTokenType = new string[](tokenContracts.length); 
        // string[] memory _pTokenName = new string[](tokenContracts.length);  
        // string[] memory _pTokenSymbol = new string[](tokenContracts.length);
        // uint256[] memory _pTokenDecimals = new uint256[](tokenContracts.length);

        // for (uint256 i = 0; i < tokenContracts.length; i++) {
        //     address tokenAddress = tokenContracts[i];
        //     IERC20Token tokenContract = IERC20Token(tokenAddress);
            
        //     _pTokenAddress[i] = tokenAddress ;
        //     _pTokenType[i] = "TokenType.ERC20" ;
        //     _pTokenName[i] = tokenContract.NAME() ;
        //     _pTokenSymbol[i] = tokenContract.SYMBOL() ;
        //     _pTokenDecimals[i] = tokenContract.DECIMALS() ;
        // }

        // childBridge Token list update



        // initialize with params
        // BridgePair memory bridgePair = BridgePair( 
        //     _key, _name, 
        //     _parentNetworkKey, _parentBridgeAddress, new address[](0), new string[](0), new string[](0), new string[](0), new uint256[](0), 
        //     _childNetworkKey, _childBridgeAddress, new address[](0), new string[](0), new string[](0), new string[](0), new uint256[](0)
        // ); 
        BridgePair memory bridgePair;

        bridgePair.key = _key; 
        bridgePair.name = _name;

        bridgePair.parentNetworkKey = _parentNetworkKey;
        bridgePair.parentBridgeAddress = _parentBridgeAddress;
        bridgePair.parentBridgeTokenAddress = new address[](0);
        bridgePair.parentBridgeTokenType = new string[](0);
        bridgePair.parentBridgeTokenName = new string[](0);
        bridgePair.parentBridgeTokenSymbol = new string[](0); 
        bridgePair.parentBridgeTokenDecimals = new uint256[](0);
        // bridgePair.parentBridgeTokenAddress = _pTokenAddress;
        // bridgePair.parentBridgeTokenType = _pTokenType;
        // bridgePair.parentBridgeTokenName = _pTokenName;
        // bridgePair.parentBridgeTokenSymbol = _pTokenSymbol; 
        // bridgePair.parentBridgeTokenDecimals = _pTokenDecimals;
        
        bridgePair.childNetworkKey = _childNetworkKey;
        bridgePair.childBridgeAddress = _childBridgeAddress;
        bridgePair.childBridgeTokenAddress = new address[](0);
        bridgePair.childBridgeTokenType = new string[](0);
        bridgePair.childBridgeTokenName = new string[](0);
        bridgePair.childBridgeTokenSymbol = new string[](0); 
        bridgePair.childBridgeTokenDecimals = new uint256[](0);

        bridgePairs.set(_key, bridgePair);
    }


    function makeKey( string memory _name, string memory _parentNetworkKey, string memory _childNetworkKey ) 
        public pure 
        returns (string memory)
    {
        return string.concat( _name, ":", _parentNetworkKey, ":", _childNetworkKey );
    }
    

    function deleteBridge(string memory key) public 
    {
        bridgePairs.remove(key);
    }


    function getBridge(string memory key)
        public view
        returns (BridgePair memory)
    {
        return bridgePairs.get(key);
    }


    function getAllBridgePairs() 
        external view 
        returns (BridgePair[] memory brigePairs)
    {
        return bridgePairs.getValues();
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
