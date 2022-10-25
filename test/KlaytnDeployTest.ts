import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, should, assert } from "chai";
should();
import { ethers } from "hardhat";

describe("KlaytnDeploy", function () {
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

        // const TokenListCallTest = await ethers.getContractFactory("TokenListCallTest", {
        //     signer: owner
        // });
        // const tokenListCallTest = await TokenListCallTest.deploy();
        // await tokenListCallTest.registered();

        return { bridge, tokenListCallTest, owner, otherAccount };
    }

    describe("Value Transfer Test", function () {

    });    
});