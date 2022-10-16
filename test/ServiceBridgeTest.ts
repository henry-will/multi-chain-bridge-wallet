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
        await bridge.deployed();

        const TokenListCallTest = await ethers.getContractFactory("TokenListCallTest", {
            signer: owner
        });
        const tokenListCallTest = await TokenListCallTest.deploy();
        await tokenListCallTest.registered();

        return { bridge, tokenListCallTest, owner, otherAccount };
    }

    describe("BridgePair Test", function () {
        it("makeKey", async function () {
            const { bridge } = await loadFixture(deployServiceBridgeFixture);
            const id = await bridge.makeKey("testBridge", "testParentNetwork:1003", "testchildNetwork:1004");
            expect(id).to.equals("testBridge:testParentNetwork:1003:testchildNetwork:1004");
        });
        it("addBridgePair & getBridge", async function () {
            const { bridge, tokenListCallTest } = await loadFixture(deployServiceBridgeFixture);
                
            const pAddress = await tokenListCallTest.getParent(); 
            // console.log("pAddress", pAddress);
            const cAddress = await tokenListCallTest.getChild(); 
            // console.log("cAddress", cAddress);

            await bridge.addBridgePair( "testBridge", 
                "testParentNetwork:1003", pAddress, 
                "testchildNetwork:1004", cAddress  );
            const aBridge = await bridge.getBridge("testBridge:testParentNetwork:1003:testchildNetwork:1004");
            expect("testBridge:testParentNetwork:1003:testchildNetwork:1004").to.equals(aBridge.key);
        });
        it("getAllBridgePairs", async function () {
            const { bridge, tokenListCallTest } = await loadFixture(deployServiceBridgeFixture);

            const pAddress = await tokenListCallTest.getParent(); 
            const cAddress = await tokenListCallTest.getChild(); 
            
            await bridge.addBridgePair( "testBridge1", 
                "testParentNetwork:1003", pAddress,
                "testchildNetwork:1004", cAddress  );
            await bridge.addBridgePair( "testBridge2", 
                "testParentNetwork:1005", pAddress,
                "testchildNetwork:1006", cAddress  );
            await bridge.addBridgePair( "testBridge3", 
                "testParentNetwork:1007", pAddress,
                "testchildNetwork:1008", cAddress  );
            const allBridges = await bridge.getAllBridgePairs();
            expect(3).to.equals(allBridges.length);
            expect("testBridge1:testParentNetwork:1003:testchildNetwork:1004").to.equals(allBridges[0].key);
            expect("testBridge2:testParentNetwork:1005:testchildNetwork:1006").to.equals(allBridges[1].key);
            expect("testBridge3:testParentNetwork:1007:testchildNetwork:1008").to.equals(allBridges[2].key);
        });
        it("deleteBridge", async function () {
            const { bridge, tokenListCallTest } = await loadFixture(deployServiceBridgeFixture);

            const pAddress = await tokenListCallTest.getParent(); 
            const cAddress = await tokenListCallTest.getChild(); 

            await bridge.addBridgePair( "testBridge1", 
                "testParentNetwork:1003", pAddress,
                "testchildNetwork:1004", cAddress  );
            await bridge.addBridgePair( "testBridge2", 
                "testParentNetwork:1005", pAddress,
                "testchildNetwork:1006", cAddress  );
            const allBridges1 = await bridge.getAllBridgePairs();
            expect(2).to.equals(allBridges1.length);
            await bridge.deleteBridge("testBridge1:testParentNetwork:1003:testchildNetwork:1004");
            const allBridges2 = await bridge.getAllBridgePairs();
            expect(1).to.equals(allBridges2.length);
            expect("testBridge2:testParentNetwork:1005:testchildNetwork:1006").to.equals(allBridges2[0].key);
            await bridge.deleteBridge("testBridge2:testParentNetwork:1005:testchildNetwork:1006");
            const allBridges3 = await bridge.getAllBridgePairs();
            expect(0).to.equals(allBridges3.length);
        });
    });    
    
    describe("Test TokenList", function () {
        it("should be listed with Token model", async function () {
            const { tokenListCallTest } = await loadFixture(deployServiceBridgeFixture);
            const tokens = await tokenListCallTest.findTokenList();
            console.log("### tokens", tokens);
            tokens.length.should.be.equals(2);
            tokens[1].name.should.be.equals("Parent ServiceChainToken 02");
        });
    });

    describe("BridgePair In Wallet", function () {
        it("should be empty when deployed", async function () {
            const { bridge } = await loadFixture(deployServiceBridgeFixture);
            const bridgePairs = await bridge.getAllBridgePairs();
            expect(0).to.equals(bridgePairs.length);
        });
        it("should be deploy brige contract and token contracts", async function () {
        });
        it("should be add with parent and child in network", async function () {
        });
        it("should be registered the token infomations of bridge", async function () {
        });
        it("should be list the parent and child tokens of a specific network", async function () {
        });
        it("Pepper: should be check CRUD permission of networks, bridges and tokens", async function () {
        });
        it("Optional: should be list tokens with klay", async function () {
        });
        it("Optional: should be add layer 3 network and game tokens", async function () {
        });
    });
});