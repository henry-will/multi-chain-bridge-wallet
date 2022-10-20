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
        _key = makeBridgeKey( _name, _parentNetworkKey, _childNetworkKey );
        require(!bridgePairs.exist(_key), string.concat(_key, " already exists"));

        // parentBridge Token list update
        BridgePair memory bridgePair = getTokenList( _parentBridgeAddress );
        bridgePair.parentNetworkKey = _parentNetworkKey;
        bridgePair.parentBridgeAddress = _parentBridgeAddress; 

        // childBridge info 
        bridgePair.childNetworkKey = _childNetworkKey;
        bridgePair.childBridgeAddress = _childBridgeAddress;
        bridgePair.childBridgeTokenAddress = new address[](0);
        bridgePair.childBridgeTokenType = new string[](0);
        bridgePair.childBridgeTokenName = new string[](0);
        bridgePair.childBridgeTokenSymbol = new string[](0); 
        bridgePair.childBridgeTokenDecimals = new uint256[](0);

        // insert bridgePair to the BridgeMap
        bridgePair.key = _key; 
        bridgePair.name = _name;
        bridgePairs.set(_key, bridgePair);
    }


    function makeBridgeKey( string memory _name, string memory _parentNetworkKey, string memory _childNetworkKey ) 
        public pure 
        returns (string memory)
    {
        return string.concat( _name, ":", _parentNetworkKey, ":", _childNetworkKey );
    }
    

    function getTokenList(address _parentBridgeAddress )
        internal view 
        returns (BridgePair memory)
    {
        BridgePair memory bridgePair;

        IBridgeTokens iBridgeTokens = IBridgeTokens(_parentBridgeAddress);
        address[] memory tokenContracts = iBridgeTokens.getRegisteredTokenList();
        uint256 length = tokenContracts.length; 

        address[] memory _pTokenAddress = new address[]( length ); 
        string[] memory _pTokenType = new string[]( length ); 
        string[] memory _pTokenName = new string[]( length );  
        string[] memory _pTokenSymbol = new string[]( length );
        uint256[] memory _pTokenDecimals = new uint256[]( length );

        for (uint256 i = 0; i < length; i++) {
            address tokenAddress = tokenContracts[i];
            IERC20Token tokenContract = IERC20Token(tokenAddress);
            
            _pTokenAddress[i] = tokenAddress ;
            _pTokenType[i] = "TokenType.ERC20" ;
            _pTokenName[i] = tokenContract.NAME() ;
            _pTokenSymbol[i] = tokenContract.SYMBOL() ;
            _pTokenDecimals[i] = tokenContract.DECIMALS() ;
        }

        bridgePair.parentBridgeTokenAddress = _pTokenAddress;
        bridgePair.parentBridgeTokenType = _pTokenType;
        bridgePair.parentBridgeTokenName = _pTokenName;
        bridgePair.parentBridgeTokenSymbol = _pTokenSymbol; 
        bridgePair.parentBridgeTokenDecimals = _pTokenDecimals;   

        return bridgePair;     
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


    function getParentTokenAddress(string memory key) 
        external view
        returns (address[] memory)
    {
        BridgePair memory bPair = getBridge( key ); 
        // BridgePair memory latestBridgePair = updateTokenList( bPair.parentBridgeAddress );
        return bPair.parentBridgeTokenAddress;
    }

    function getParentTokenName(string memory key) 
        external view
        returns (string[] memory)
    {
        BridgePair memory bPair = getBridge( key ); 
        return bPair.parentBridgeTokenName;
    }

    function getParentTokenSymbol(string memory key) 
        external view
        returns (string[] memory)
    {
        BridgePair memory bPair = getBridge( key ); 
        return bPair.parentBridgeTokenSymbol;
    }


    function updateParentTokenList(string memory key) 
        external 
    {
        BridgePair memory bPair = getBridge( key ); 

        // parentBridge Token list update
        BridgePair memory bridgePair = getTokenList( bPair.parentBridgeAddress );
        bridgePair.parentNetworkKey = bPair.parentNetworkKey;
        bridgePair.parentBridgeAddress = bPair.parentBridgeAddress; 

        // childBridge info 
        bridgePair.childNetworkKey = bPair.childNetworkKey;
        bridgePair.childBridgeAddress = bPair.childBridgeAddress;
        bridgePair.childBridgeTokenAddress = bPair.childBridgeTokenAddress;
        bridgePair.childBridgeTokenType = bPair.childBridgeTokenType;
        bridgePair.childBridgeTokenName = bPair.childBridgeTokenName;
        bridgePair.childBridgeTokenSymbol = bPair.childBridgeTokenSymbol; 
        bridgePair.childBridgeTokenDecimals = bPair.childBridgeTokenDecimals;

        // update bridgePair to the BridgeMap
        bridgePair.key = bPair.key; 
        bridgePair.name = bPair.name;
        bridgePairs.set( key, bridgePair);
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
