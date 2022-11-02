// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IBridgeTokens.sol";
import "../interfaces/IERC20Token.sol";
import "../interfaces/IERC721Token.sol";

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
        string memory _parentBridgeName, 
        address _parentBridgeAddress,
        string memory _childBridgeName, 
        address _childBridgeAddress ) public 
    {
        string memory _key; 
        _key = string.concat( _name, "@", _parentBridgeName, "&", _childBridgeName );
        require(!bridgePairs.exist(_key), string.concat(_key, " already exists"));

        // BridgePair
        BridgePair storage bridgePair = bridgePairs.get(_key);
        bridgePair.key = _key; 
        bridgePair.name = _name;

        // parentBridge
        bridgePair.parentBridge.name = _parentBridgeName;
        bridgePair.parentBridge.bridgeAddress = _parentBridgeAddress;
        Token[] memory parentTokens = getTokens(_parentBridgeAddress);
        for (uint256 i = 0; i < parentTokens.length; i++) {
            bridgePair.parentBridge.registeredTokens.push(parentTokens[i]);
        }

        // childBridge
        bridgePair.childBridge.name = _childBridgeName;
        bridgePair.childBridge.bridgeAddress = _childBridgeAddress;
        Token[] memory childTokens = getTokens(_childBridgeAddress);
        for (uint256 i = 0; i < childTokens.length; i++) {
            bridgePair.childBridge.registeredTokens.push(childTokens[i]);
        }

        // insert bridgePair to the BridgeMap
        bridgePairs.set(_key, bridgePair);
    }


    function getTokens(address _bridgeAddress )
        internal view 
        returns (Token[] memory)
    {
        IBridgeTokens iBridgeTokens = IBridgeTokens(_bridgeAddress);
        address[] memory tokenContracts = iBridgeTokens.getRegisteredTokenList();
        uint256 length = tokenContracts.length; 

        Token[] memory tokens = new Token[](length);

        for (uint256 i = 0; i < length; i++) {
            address tokenAddress = tokenContracts[i];

            if (isContract(tokenAddress)){ 
                IERC20Token ERC20tokenContract = IERC20Token(tokenAddress);
                if ( ERC20tokenContract.supportsInterface(type(IERC20Token).interfaceId) ) {
                    tokens[i].tokenAddress = tokenAddress ;
                    tokens[i].tokenType = TokenType.ERC20 ;
                    tokens[i].name = ERC20tokenContract.NAME() ;
                    tokens[i].symbol = ERC20tokenContract.SYMBOL() ;
                    tokens[i].decimals = ERC20tokenContract.DECIMALS() ;    
                } 

                IERC721Token ERC721tokenContract = IERC721Token(tokenAddress);
                if ( ERC721tokenContract.supportsInterface(type(IERC721Token).interfaceId) ) {
                    tokens[i].tokenAddress = tokenAddress ;
                    tokens[i].tokenType = TokenType.ERC721 ;
                    tokens[i].name = ERC721tokenContract.NAME() ;
                    tokens[i].symbol = "na" ;
                    tokens[i].decimals = 0 ;    
                }
            }
        } 

        return tokens;     
    }


    function isContract(address addr) internal view returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }


    function deleteBridge(string memory key) public 
    {
        bridgePairs.remove(key);
    }


    function getBridge(string memory key)
        public view
        returns (BridgePair memory)
    {
        BridgePair memory bPair = bridgePairs.get( key );
        return bPair;
    }


    function getAllBridgePairs() 
        public view 
        returns (BridgePair[] memory brigePairs)
    {
        return bridgePairs.getValues();
    }


    function getTotalTokensNum()
        public view
        returns (uint256) 
    {
        uint256 totalTokenNum = 0;

        BridgePair[] memory allBridgePairs = getAllBridgePairs();

        uint256 pairSize = allBridgePairs.length;
        for (uint256 pairIndex = 0; pairIndex < pairSize; pairIndex++) {
            totalTokenNum += allBridgePairs[pairIndex].parentBridge.registeredTokens.length; 
            totalTokenNum += allBridgePairs[pairIndex].childBridge.registeredTokens.length; 
        }

        return totalTokenNum;
    }


    function getAllTokens() 
        external view 
        returns (Token[] memory)
    {
        uint256 tokenIndex = 0;
        uint256 tokenSize = getTotalTokensNum(); 
        Token[] memory tokens = new Token[](tokenSize); 

        BridgePair[] memory allBridgePairs = getAllBridgePairs();
        
        uint256 pairSize = allBridgePairs.length;
        for (uint256 i = 0; i < pairSize; i++) {

            uint256 parentSize = allBridgePairs[i].parentBridge.registeredTokens.length;
            for (uint256 j = 0; j < parentSize; j++) {
                tokens[tokenIndex++] = Token({
                    tokenAddress :  allBridgePairs[i].parentBridge.registeredTokens[j].tokenAddress, 
                    tokenType : allBridgePairs[i].parentBridge.registeredTokens[j].tokenType,
                    name : allBridgePairs[i].parentBridge.registeredTokens[j].name, 
                    symbol : allBridgePairs[i].parentBridge.registeredTokens[j].symbol,
                    decimals : allBridgePairs[i].parentBridge.registeredTokens[j].decimals
                }); 
            }

            uint256 childSize = allBridgePairs[i].childBridge.registeredTokens.length;
            for (uint256 j = 0; j < childSize; j++) {
                tokens[tokenIndex++] = Token({
                    tokenAddress :  allBridgePairs[i].childBridge.registeredTokens[j].tokenAddress, 
                    tokenType : allBridgePairs[i].childBridge.registeredTokens[j].tokenType,
                    name : allBridgePairs[i].childBridge.registeredTokens[j].name, 
                    symbol : allBridgePairs[i].childBridge.registeredTokens[j].symbol,
                    decimals : allBridgePairs[i].childBridge.registeredTokens[j].decimals
                }); 
            }
        }

        return tokens;
    }


    function updateParentTokenList(string memory key) 
        external 
    {
        // BridgePair
        BridgePair storage bPair = bridgePairs.get(key); 

        // parentBridge tokens update
        delete bPair.parentBridge.registeredTokens; 
        Token[] memory parentTokens = getTokens(bPair.parentBridge.bridgeAddress);
        for (uint256 i = 0; i < parentTokens.length; i++) {
            bPair.parentBridge.registeredTokens.push(parentTokens[i]);
        }

        // childBridge tokens update 
        delete bPair.childBridge.registeredTokens;
        Token[] memory childTokens = getTokens(bPair.childBridge.bridgeAddress);
        for (uint256 i = 0; i < childTokens.length; i++) {
            bPair.childBridge.registeredTokens.push(childTokens[i]);
        }

        bridgePairs.set( key, bPair);
    }
}
