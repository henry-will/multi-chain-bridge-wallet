import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, should, assert } from "chai";
should();
import { ethers } from "hardhat";

describe("ServiceBridge", function () {
    async function deployServiceBridgeFixture() {
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

        const ServiceBridge = await ethers.getContractFactory("ServiceBridge", {
            signer: owner,
            libraries: {
                IterableBridgeMap: iterableBridgeMapLib.address,
            }
        });
        const bridge = await ServiceBridge.deploy();

        const TokenListCallTest = await ethers.getContractFactory("TokenListCallTest", {
            signer: owner,
        });
        const tokenListCallTest = await TokenListCallTest.deploy();


        return { bridge, tokenListCallTest, owner, otherAccount };
    }
    describe("Test TokenList", function () {
        it("should be listed with Token model", async function () {
            const { tokenListCallTest } = await loadFixture(deployServiceBridgeFixture);
            await tokenListCallTest.registered();
            const tokens = await tokenListCallTest.findTokenList();
            console.log("### tokens", tokens);
            tokens.length.should.be.equals(2);
            tokens[1].name.should.be.equals("Parent ServiceChainToken 02");
        });
    });

    describe("BridgePair", function () {
        it("should be empty when deployed", async function () {
            const { bridge } = await loadFixture(deployServiceBridgeFixture);
            const bridgePairs = await bridge.getAllBridgePairs();
            expect(0).to.equals(bridgePairs.length);
        });
        it("should be add with parent and child", async function () {
        });
        it("should be registered the token infomations of bridge", async function () {
        });
        it("should be list the parent and child tokens of a specific network", async function () {
        });
    });
});