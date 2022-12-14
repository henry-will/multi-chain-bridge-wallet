// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../models/TokenModel.sol";
import "../models/NetworkModel.sol";
import "../models/NetworkKeyModel.sol";
import "../libs/IterableNetworkMap.sol";
import "./AccessControlService.sol";

contract NetworkService is NetworkKeyModel, AccessControlService {
    using IterableNetworkMap for IterableNetworkMap.Map;
    IterableNetworkMap.Map private networks;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function addNetwork(
        string memory chainId,
        string memory shortName,
        string memory name,
        string memory rpcUrl,
        uint256 networkId,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenDecimals,
        string memory childKey,
        string memory parentKey,
        uint8 layer
    ) public payable returns (bool) {
        string memory key = getKey(chainId, shortName);
        require(!networks.exist(key), string.concat(key, " already exists"));

        // add Role
        addNetworkAdminRole(key);

        Network memory network;
        network.key = key;
        network.chainId = chainId;
        network.shortName = shortName;
        network.name = name;
        network.rpcUrl = rpcUrl;
        network.networkId = networkId;

        setNativeCurrency(network, tokenName, tokenSymbol, tokenDecimals);

        network.childKey = childKey;
        network.parentKey = parentKey;
        network.layer = layer;
        initDetail(network);
        networks.set(key, network);

        return true;
    }

    function deleteNetwork(string memory key) public onlyServiceRole(key) {
        require(networks.exist(key), string.concat("Not Found Key ", key));
        networks.remove(key);
    }

    function updateNetwork(
        string memory key,
        string memory chainId,
        string memory shortName,
        string memory name,
        string memory rpcUrl,
        uint256 networkId
    ) public onlyServiceRole(key) {
        string memory newKey = getKey(chainId, shortName);
        require(
            StringUtil.stringCompare(key, newKey),
            string.concat(
                "Not Found, current key ",
                key,
                " is differrent from ",
                newKey
            )
        );
        require(networks.exist(key), string.concat("Not Found Key ", key));

        Network memory network = networks.get(key);
        network.name = name;
        network.rpcUrl = rpcUrl;
        network.networkId = networkId;
        networks.set(key, network);
    }

    function updateNetworkActivation(string memory key, bool activated)
        public
        onlyServiceRole(key)
    {
        require(networks.exist(key), string.concat("Not Found Key ", key));
        Network memory network = networks.get(key);
        network.detail.activated = activated;
        networks.set(key, network);
    }

    function updateNetworkShowable(string memory key, bool show)
        public
        onlyServiceRole(key)
    {
        require(networks.exist(key), string.concat("Not Found Key ", key));
        Network memory network = networks.get(key);
        network.detail.show = show;
        networks.set(key, network);
    }

    function size() public view returns (uint256) {
        return networks.size();
    }

    function getNetwork(string memory key)
        public
        view
        returns (Network memory)
    {
        return networks.get(key);
    }

    function getKeys() external view returns (string[] memory) {
        return networks.getKeys();
    }

    function getLayer1Networks() external view returns (Network[] memory) {
        Network[] memory activeNetworks = new Network[](networks.size());
        uint256 activeIndex = 0;
        for (uint256 index = 0; index < networks.size(); index++) {
            string memory key = networks.getKeyAtIndex(index);
            Network memory network = networks.get(key);
            if (network.layer == 1) {
                activeNetworks[activeIndex++] = network;
            }
        }
        for (uint256 index = activeIndex; index < networks.size(); index++) {
            delete activeNetworks[index];
        }
        return activeNetworks;
    }

    function getAllNetworks() external view returns (Network[] memory) {
        return networks.getValues();
    }

    function getActiveNetworks() external view returns (Network[] memory) {
        Network[] memory activeNetworks = new Network[](networks.size());
        uint256 activeIndex = 0;
        for (uint256 index = 0; index < networks.size(); index++) {
            string memory key = networks.getKeyAtIndex(index);
            Network memory network = networks.get(key);
            if (network.detail.activated) {
                activeNetworks[activeIndex++] = network;
            }
        }
        for (uint256 index = activeIndex; index < networks.size(); index++) {
            delete activeNetworks[index];
        }
        return activeNetworks;
    }

    function setNativeCurrency(
        Network memory network,
        string memory name,
        string memory symbol,
        uint256 decimals
    ) private pure {
        network.nativeCurrency.name = name;
        network.nativeCurrency.symbol = symbol;
        network.nativeCurrency.decimals = decimals;
    }

    function initDetail(Network memory network) private pure {
        network.detail.activated = false;
        network.detail.show = false;
        network.detail.displayOrder = 0;
        network.detail.networkStatus = false;
    }
}
