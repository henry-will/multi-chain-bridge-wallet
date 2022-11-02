import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, should, assert } from "chai";
should();
import { ethers } from "hardhat";

describe("ServiceBridge", function () {
    async function deployServiceBridgeFixture() {
        const [owner, enop, scop] = await ethers.getSigners();

        // BridgeRestry Contracts & Library
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


        // ServiceChain Contracts
        // EN bridge 
        const ENbridge = await ethers.getContractFactory("Bridge", {signer: owner});
        const enbridge = await ENbridge.deploy(false);
        await enbridge.deployed();
        await enbridge.registerOperator(enop.address);
        console.log('EN bridge address: ', enbridge.address);

        // EN ERC20 Token
        const ENtoken = await ethers.getContractFactory("ServiceChainToken", {signer: owner});
        const entoken = await ENtoken.deploy(enbridge.address);
        await entoken.deployed(enbridge.address);
        await entoken.addMinter(enbridge.address);
        console.log('EN Token address: ', entoken.address);

        // EN ERC721 Token 
        const ENtoken2 = await ethers.getContractFactory("ServiceChainNFT", {signer: owner});
        const entoken2 = await ENtoken2.deploy(enbridge.address);
        await entoken2.deployed(enbridge.address);
        await entoken2.addMinter(enbridge.address);
        console.log('EN NFT Token address: ', entoken2.address);

        // SCN bridge
        const SCbridge = await ethers.getContractFactory("Bridge", {signer: owner});
        const scbridge = await SCbridge.deploy(false);
        await scbridge.deployed();
        await scbridge.registerOperator(scop.address);
        console.log('SCN bridge address: ', scbridge.address);

        // SCN ERC20 Token 
        const SCtoken = await ethers.getContractFactory("ServiceChainToken", {signer: owner});
        const sctoken = await SCtoken.deploy(scbridge.address);
        await sctoken.deployed(scbridge.address);
        await sctoken.addMinter(scbridge.address);
        console.log('SCN Token address: ', sctoken.address);

        // SCN ERC721 Token
        const SCtoken2 = await ethers.getContractFactory("ServiceChainNFT", {signer: owner});
        const sctoken2 = await SCtoken2.deploy(scbridge.address);
        await sctoken2.deployed(scbridge.address);
        await sctoken2.addMinter(scbridge.address);
        console.log('SCN NFT Token address: ', sctoken2.address);
        console.log('\n\n');

        // EN-SCN pair register
        await enbridge.registerToken(entoken.address, sctoken.address);
        await enbridge.registerToken(entoken2.address, sctoken2.address);
        await enbridge.transferOwnership(enop.address);

        // SCN-EN pair register
        await scbridge.registerToken(sctoken.address, entoken.address);
        await scbridge.registerToken(sctoken2.address, entoken2.address);
        await scbridge.transferOwnership(scop.address);

        return { bridge, enbridge, entoken, scbridge, sctoken, owner, enop, scop };
    }
    describe("BridgePair Test", function () {
        it("getAllBridgePairs", async function () {
            const { bridge, enbridge, entoken, scbridge, sctoken, owner, enop, scop  } = await loadFixture(deployServiceBridgeFixture);

            const pAddress = enbridge.address; 
            const cAddress = scbridge.address; 
            
            await bridge.addBridgePair( "testBridge1", "Cypress", pAddress, "testchildNetwork:1003", cAddress  );
            const allBridges = await bridge.getAllBridgePairs();
            console.log( "Bridge pair list", allBridges );
            expect(1).to.equals(allBridges.length);
            expect("testBridge1@testchildNetwork:1003").to.equals(allBridges[0].key);
        });
        it("Get All Token List", async function () {
            const { bridge, enbridge, entoken, scbridge, sctoken, owner, enop, scop  } = await loadFixture(deployServiceBridgeFixture);

            const pAddress = enbridge.address; 
            const cAddress = scbridge.address; 
            
            await bridge.addBridgePair( "testBridge1", "Cypress", pAddress, "testchildNetwork:1003", cAddress  );
            const allTokens = await bridge.getAllTokens();
            console.log( "tokens list", allTokens );
            expect(4).to.equals(allTokens.length);            
        });
    });    
});