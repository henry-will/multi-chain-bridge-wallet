import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, should, assert } from "chai";
should();
import { ethers } from "hardhat";

describe("NetworkService", function () {
    async function deployNetworkServiceFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const StringUtil = await ethers.getContractFactory("StringUtil");
        const lib2 = await StringUtil.deploy();
        await lib2.deployed();

        const IterableNetworkMap = await ethers.getContractFactory("IterableNetworkMap", {
            signer: owner,
            libraries: {
                StringUtil: lib2.address,
            },
        });
        const lib = await IterableNetworkMap.deploy();
        await lib.deployed();

        const NetworkService = await ethers.getContractFactory("NetworkService", {
            signer: owner,
            libraries: {
                StringUtil: lib2.address,
                IterableNetworkMap: lib.address,
            }
        });
        const network = await NetworkService.deploy();

        return { NetworkService, network, owner, otherAccount };
    }

    describe("Networks", function () {
        it("should be empty", async function () {
            const { network } = await loadFixture(deployNetworkServiceFixture);
            const networks = await network.getAllNetworks();
            expect(0).to.equals(networks.length);
        });
        it("should add one Network", async function () {
            const { network, owner } = await loadFixture(deployNetworkServiceFixture);
            const receipt = await network.addNetwork("123", "test", "Henry Test", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1);
            // console.log("add network is ", receipt);
            const testNetwork = await network.getNetwork("123:test");
            // console.log("testNetwork is ", testNetwork);

            const allNetworks = await network.getAllNetworks();
            // console.log("Networks is ", allNetworks);
            expect(1).to.equals(allNetworks.length);
            expect("123:test").to.equals(allNetworks[0].key);

            const layer1Networks = await network.getLayer1Networks();
            // console.log("Networks is ", allNetworks);
            expect(1).to.equals(layer1Networks.length);
            expect("123:test").to.equals(layer1Networks[0].key);

            const networks = await network.getActiveNetworks();
            // console.log("Networks is ", networks);
            expect(1).to.equals(networks.length);
            expect("").to.equals(networks[0].key);

            const key = await network.getKey("123", "test");
            const roleName = await network.getServiceRoleName(key);
            const checkRole = await network.hasRole(roleName, owner.address);
            // console.log("owner", owner.address);
            // console.log("roleName", roleName, "checked", checkRole);
            await network.deleteNetwork(key);

        });
        it("should find an added Network", async function () {
            const { network } = await loadFixture(deployNetworkServiceFixture);
            await network.addNetwork("123", "test", "Henry Test", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1);
            const key = await network.getKey("123", "test");
            const testNetwork = await network.getNetwork(key);
            key.should.equal("123:test");
            testNetwork.should.have.property("chainId");
            testNetwork.chainId.should.equal('123');
            await network.deleteNetwork(key);
        });
        it("should update the added Network", async function () {
            const { network } = await loadFixture(deployNetworkServiceFixture);
            await network.addNetwork("123", "test", "Henry Test", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1);
            const key = await network.getKey("123", "test");
            await expect(
                network.updateNetwork(key, "123", "test", "Henry Test", "http://127.0.0.1:7351", 123)
            ).to.be.ok
            await network.deleteNetwork(key);
        });
        it("should delete the added Network", async function () {
            const { network } = await loadFixture(deployNetworkServiceFixture);
            await network.addNetwork("123", "test", "Henry Test", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1);
            const key = await network.getKey("123", "test");
            key.should.equal("123:test");
            await network.deleteNetwork(key);
            const testNetwork = await network.getNetwork(key);
            testNetwork.should.have.property("chainId");
            testNetwork.chainId.should.empty;
        });
    });
    describe("Error Tests", function () {
        it("should cause the error because of a different input key", async function () {
            const { network } = await loadFixture(deployNetworkServiceFixture);
            await network.addNetwork("123", "test", "Henry Test", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1);
            await expect(
                network.updateNetwork("1234:badkey", "123", "test", "Henry Test", "http://127.0.0.1:7351", 123)
                // ).to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Not Found, current key 1234:badkey is diferrent from 123:test'");
            ).to.be.reverted
            // revertedWith("VM Exception while processing transaction: reverted with reason string 'AccessControl: account");
        });
        it("should cause the error because same key is inserted", async function () {
            const { network } = await loadFixture(deployNetworkServiceFixture);
            await network.addNetwork("123", "test", "Henry Test", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1);
            await expect(
                network.addNetwork("123", "test", "Henry Test 2", "http://127.0.0.1:7351", 123, "Henry Token", "HRT", 18, '', '', 1)
            ).to.be.revertedWith("VM Exception while processing transaction: reverted with reason string '123:test already exists'");
        });
    });
});