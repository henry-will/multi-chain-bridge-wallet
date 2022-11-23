// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IOwnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * Registry
 * - Admin : contract(NetworkService, BridgeService) owner
 * - Member : registry admin, members managed by admin
 * - Action :
 *   - Create, update and delete bridge informations
 *
 * Role Manage
 * - Change Registry Admin : Registry admin
 * - Manage Registry Memeber : Registry admin
 * - Add Bridge Admin : Registry member
 * - Change Bridge Admin : Registry member, Bridge admin
 * - Manage Bridge Member : Bridge Admin
 * - RoleData
 *   "ADMIN_REGISTRY_ROLE" -> adminRole: DEFAULT_ADMIN_ROLE, members: Registry admin
 *   "REGISTRY_ROLE" -> adminRole: ADMIN_REGISTRY_ROLE, members: Registry admin, member
 *   "keccek256(ADMIN + BRIDGE_ADDRESS)" -> adminRole: REGISTRY_ROLE, members: bridge owner
 *   "keccek246(BRIDGE_ADDRESS)" -> adminRole: keccek256(ADMIN + BRIDGE_ADDRESS), members: bridge owner, bridge member
 *
 * Bridge Admin : Bridge contract, Token contract CUD
 * - Admin : contract(Bridge and token contract) owner
 * - Member : Registry member, bridge admin, members managed by bridge admin
 * - Action
 *   - Bridge Create : bridge admin
 *   - Bridge Delete : bridge admin
 *   - Bridge Update : bridge member
 *   - Token Create : bridge member
 *   - Token Update : bridge memeber
 *   - Token Delete : bridge member
 * -
 */
contract AccessControlService is AccessControl {
    bytes32 public constant ADMIN_REGISTRY_ROLE =
        keccak256("ADMIN_REGISTRY_ROLE");
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");

    constructor() {
        // grant uper admin
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        // grant registry admin
        _setRoleAdmin(ADMIN_REGISTRY_ROLE, DEFAULT_ADMIN_ROLE);
        _grantRole(ADMIN_REGISTRY_ROLE, _msgSender());

        // grant registry member
        _setRoleAdmin(REGISTRY_ROLE, ADMIN_REGISTRY_ROLE);
        _grantRole(REGISTRY_ROLE, _msgSender());
    }

    function grantRegistryAdminRole(address adminAddress) public {
        grantRole(ADMIN_REGISTRY_ROLE, adminAddress);
    }

    function revokeRegistryAdminRole(address adminAddress) public {
        revokeRole(ADMIN_REGISTRY_ROLE, adminAddress);
    }

    function grantRegistryRole(address memberAddress) public {
        grantRole(REGISTRY_ROLE, memberAddress);
    }

    function revokeRegistryRole(address memberAddress) public {
        revokeRole(REGISTRY_ROLE, memberAddress);
    }

    /**
     * In first, the addNetworkAdminRole had been called, and then the addBridgeAdminRole is called.
     */
    function addBridgeAdminRole(string memory key, address bridgeAddress)
        public
    {
        bytes32 bridgeAdminRole = getServiceAdminRoleName(key);
        bytes32 bridgeRole = getServiceRoleName(key);

        address bridgeOwner = IOwnable(bridgeAddress).owner();
        address registryMember = _msgSender();
        // grant bridge admin
        _grantRole(bridgeAdminRole, registryMember);
        _grantRole(bridgeAdminRole, bridgeOwner);

        // grant bridge member
        _grantRole(bridgeRole, bridgeOwner);
    }

    function addNetworkAdminRole(string memory key) public {
        bytes32 networkAdminRole = getServiceAdminRoleName(key);
        bytes32 networkRole = getServiceRoleName(key);
        address networkOwner = _msgSender();

        // grant bridge admin
        _setRoleAdmin(networkAdminRole, REGISTRY_ROLE);
        _grantRole(networkAdminRole, networkOwner);

        // grant bridge member
        _setRoleAdmin(networkRole, networkAdminRole);
        _grantRole(networkRole, networkOwner);
    }

    modifier onlyServiceRole(string memory key) {
        _checkRole(getServiceRoleName(key));
        _;
    }

    function getServiceAdminRoleName(string memory key)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode("ADMIN", key));
    }

    function getServiceRoleName(string memory key)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(key));
    }

    function grantServiceRole(string memory key, address memberAddress) public {
        grantRole(getServiceRoleName(key), memberAddress);
    }

    function revokeServiceRole(string memory key, address memberAddress)
        public
    {
        revokeRole(getServiceRoleName(key), memberAddress);
    }
}
