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
        string memory _parentNetwork, 
        address _parentBridgeAddress,
        string memory _childNetwork, 
        address _childBridgeAddress ) public 
    {
        string memory _key; 
        _key = string.concat( _name, "@", _childNetwork );
        require(!bridgePairs.exist(_key), string.concat(_key, " already exists"));

        // parentBridge Token list update
        BridgePair memory bridgePair = getTokenList( _parentBridgeAddress );
        bridgePair.parentNetwork = _parentNetwork;
        bridgePair.parentBridgeAddress = _parentBridgeAddress; 

        // childBridge info  -> 로컬 네트워크 통해서 업데이트 하도록... 
        bridgePair.childNetwork = _childNetwork;
        bridgePair.childBridgeAddress = _childBridgeAddress;
        bridgePair.childBridgeTokenSize = 0;
        bridgePair.childBridgeTokenAddress = new address[](0);
        bridgePair.childBridgeTokenType = new TokenType[](0);
        bridgePair.childBridgeTokenName = new string[](0);
        bridgePair.childBridgeTokenSymbol = new string[](0); 
        bridgePair.childBridgeTokenDecimals = new uint256[](0);

        // insert bridgePair to the BridgeMap
        bridgePair.key = _key; 
        bridgePair.name = _name;
        bridgePairs.set(_key, bridgePair);
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
        TokenType[] memory _pTokenType = new TokenType[]( length ); 
        string[] memory _pTokenName = new string[]( length );  
        string[] memory _pTokenSymbol = new string[]( length );
        uint256[] memory _pTokenDecimals = new uint256[]( length );

        for (uint256 i = 0; i < length; i++) {
            address tokenAddress = tokenContracts[i];

            if (isContract(tokenAddress)){ 
                IERC20Token tokenContract = IERC20Token(tokenAddress);

                if ( tokenContract.supportsInterface(type(IERC20Token).interfaceId) ) {
                    _pTokenAddress[i] = tokenAddress ;
                    _pTokenType[i] = TokenType.ERC20 ;
                    _pTokenName[i] = tokenContract.NAME() ;
                    _pTokenSymbol[i] = tokenContract.SYMBOL() ;
                    _pTokenDecimals[i] = tokenContract.DECIMALS() ;    
                } 

                IERC721Token tokenContract2 = IERC721Token(tokenAddress);
                if ( tokenContract2.supportsInterface(type(IERC721Token).interfaceId) ) {
                    _pTokenAddress[i] = tokenAddress ;
                    _pTokenType[i] = TokenType.ERC721 ;
                    _pTokenName[i] = tokenContract2.NAME() ;
                    _pTokenSymbol[i] = "na" ;
                    _pTokenDecimals[i] = 0 ;    
                }
            }
        }

        bridgePair.parentBridgeTokenSize = length;
        bridgePair.parentBridgeTokenAddress = _pTokenAddress;
        bridgePair.parentBridgeTokenType = _pTokenType;
        bridgePair.parentBridgeTokenName = _pTokenName;
        bridgePair.parentBridgeTokenSymbol = _pTokenSymbol; 
        bridgePair.parentBridgeTokenDecimals = _pTokenDecimals;   

        return bridgePair;     
    }

    function isContract(address addr) internal view returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

    function getContractType(address addr) internal view returns (bool) {
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
        return bridgePairs.get(key);
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
            totalTokenNum += allBridgePairs[pairIndex].parentBridgeTokenSize; 
            totalTokenNum += allBridgePairs[pairIndex].childBridgeTokenSize; 
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
        for (uint256 pairIndex = 0; pairIndex < pairSize; pairIndex++) {

            uint256 parentSize = allBridgePairs[pairIndex].parentBridgeTokenSize; 
            for (uint256 parentIndex = 0; parentIndex < parentSize; parentIndex++) {
                // tokens[tokenIndex++] = Token({
                //     tokenAddress :  0x79F970a8456725f1CFB263a899522b629319C680, 
                //     tokenType : TokenType.ERC20,
                //     name : "test Name", 
                //     symbol : "test symbol",
                //     decimals : 18
                // }); 
                tokens[tokenIndex++] = Token({
                    tokenAddress :  allBridgePairs[pairIndex].parentBridgeTokenAddress[parentIndex], 
                    tokenType : allBridgePairs[pairIndex].parentBridgeTokenType[parentIndex],
                    name : allBridgePairs[pairIndex].parentBridgeTokenName[parentIndex], 
                    symbol : allBridgePairs[pairIndex].parentBridgeTokenSymbol[parentIndex],
                    decimals : allBridgePairs[pairIndex].parentBridgeTokenDecimals[parentIndex]
                }); 
            }

            uint256 childSize = allBridgePairs[pairIndex].childBridgeTokenSize; 
            for (uint256 childIndex = 0; childIndex < childSize; childIndex++) {
                // tokens[tokenIndex++] = Token({
                //     tokenAddress :  0x79F970a8456725f1CFB263a899522b629319C680, 
                //     tokenType : TokenType.ERC20,
                //     name : "test Name", 
                //     symbol : "test symbol",
                //     decimals : 18
                // }); 
                tokens[tokenIndex++] = Token({
                    tokenAddress :  allBridgePairs[pairIndex].childBridgeTokenAddress[childIndex], 
                    tokenType : allBridgePairs[pairIndex].childBridgeTokenType[childIndex],
                    name : allBridgePairs[pairIndex].childBridgeTokenName[childIndex], 
                    symbol : allBridgePairs[pairIndex].childBridgeTokenSymbol[childIndex],
                    decimals : allBridgePairs[pairIndex].childBridgeTokenDecimals[childIndex]
                }); 
            }
        }

        return tokens;
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
        bridgePair.parentNetwork = bPair.parentNetwork;
        bridgePair.parentBridgeAddress = bPair.parentBridgeAddress; 

        // childBridge info 
        bridgePair.childNetwork = bPair.childNetwork;
        bridgePair.childBridgeAddress = bPair.childBridgeAddress;
        bridgePair.childBridgeTokenSize = bPair.childBridgeTokenSize;
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
