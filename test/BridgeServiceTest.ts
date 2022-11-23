import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, should, assert } from "chai";
should();
import { ethers } from "hardhat";
import { BridgeService } from "../typechain";

describe("BridgeService", function () {
    async function deployBridgeServiceFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const StringUtil = await ethers.getContractFactory("StringUtil");
        const stringUtilLib = await StringUtil.deploy();
        await stringUtilLib.deployed();

        const IterableBridgeMap = await ethers.getContractFactory("IterableBridgeMap", {
            signer: owner,
            libraries: {
                StringUtil: stringUtilLib.address,
            },
        });
        const iterableBridgeMapLib = await IterableBridgeMap.deploy();
        await iterableBridgeMapLib.deployed();

        const BridgeService = await ethers.getContractFactory("BridgeService", {
            signer: owner,
            libraries: {
                IterableBridgeMap: iterableBridgeMapLib.address,
            }
        });
        const bridge = await BridgeService.deploy();

        const TokenListCallTest = await ethers.getContractFactory("TokenListCallTest", {
            signer: owner,
        });
        const tokenListCallTest = await TokenListCallTest.deploy();

        const ParentBridge = await ethers.getContractFactory("ParentBridgeTest", {
            signer: owner,
        });
        const parentBridge = await ParentBridge.deploy();

        const ChildBridge = await ethers.getContractFactory("ChildBridgeTest", {
            signer: owner,
        });
        const childBridge = await ChildBridge.deploy();

        return { bridge, tokenListCallTest, parentBridge, childBridge, owner, otherAccount };
    }
    describe("Test TokenList", function () {
        it("should be listed with Token model", async function () {
            const { tokenListCallTest } = await loadFixture(deployBridgeServiceFixture);
            await tokenListCallTest.registered();
            const tokens = await tokenListCallTest.findTokenList();
            // console.log("### tokens", tokens);
            tokens.length.should.be.equals(3);
            tokens[1].name.should.be.equals("Parent ServiceChainToken 02");
        });
        it("should be added Bridge", async () => {
            const { bridge } = await loadFixture(deployBridgeServiceFixture);
        });
    });

    describe("BridgePair In Wallet", function () {
        it("should be empty when deployed", async function () {
            const { bridge } = await loadFixture(deployBridgeServiceFixture);
            const size = await bridge.size();
            expect(0).to.equals(size);
        });
        it("should be deploy brige contract and token contracts", async function () {
            const { bridge, childBridge, parentBridge } = await loadFixture(deployBridgeServiceFixture);
            const key = "123:key";
            const childKey = "234:key";
            await bridge.addBridgePair(key, "parent", parentBridge.address, childKey, "child", childBridge.address);
            const bridgePair = await bridge.getBridgePair(key);
            expect(bridgePair.parentBridge.name).to.equals("parent");
            // console.log("bridgePairs", bridgePair.parentBridge.registeredTokens);
            await bridge.deleteBridgePair(key)
        });
        it("should be updated with the right permission", async function () {
            const { bridge, childBridge, parentBridge } = await loadFixture(deployBridgeServiceFixture);
            const key = "123:key";
            const childKey = "234:key";
            await bridge.addBridgePair(key, "parent", parentBridge.address, childKey, "child", childBridge.address);
            let bridgePair = await bridge.getBridgePair(key);
            expect(bridgePair.parentBridge.name).to.equals("parent");
            // console.log("bridgePairs", bridgePair.parentBridge.registeredTokens);
            await expect(
                await bridge.updateParentBridge(key, "parent updated", parentBridge.address)
            ).to.be.ok;
            bridgePair = await bridge.getBridgePair(key);
            expect(bridgePair.parentBridge.name).to.equals("parent updated");
            await bridge.deleteBridgePair(key)
        });
        it("should not be deleted with the wrong permission", async function () {
            const { bridge, childBridge, parentBridge, otherAccount } = await loadFixture(deployBridgeServiceFixture);
            const key = "123:key";
            const childKey = "234:key";
            await bridge.addBridgePair(key, "parent", parentBridge.address, childKey, "child", childBridge.address);
            const bridgePair = await bridge.getBridgePair(key);
            expect(bridgePair.parentBridge.name).to.equals("parent");
            // console.log("bridgePairs", bridgePair.parentBridge.registeredTokens);

            await expect(
                bridge.connect(otherAccount).deleteBridgePair(key)
            ).to.be.reverted;
        });
        it("should be add with parent and child in network", async function () {
        });
        it("should be registered the token infomations of bridge", async function () {
        });
        it("should be list the parent and child tokens of a specific network", async function () {
        });
        it("should be check CRUD permission of networks, bridges and tokens", async function () {
        });
        it("Optional: should be list tokens with klay", async function () {
        });
        it("Optional: should be add layer 3 network and game tokens", async function () {
        });
    });
});