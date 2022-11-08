
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, should } from "chai";
should();
import { ethers } from "hardhat";

describe("ServiceNetworkKey", function () {
    async function deployTokenServiceFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const TokenService = await ethers.getContractFactory("TokenService");
        const tokenService = await TokenService.deploy();

        const TokenListCallTest = await ethers.getContractFactory("TokenListCallTest");
        const tokenListCallTest = await TokenListCallTest.deploy();

        return { tokenService, tokenListCallTest, owner };
    }

    describe("Deployed Contract", function () {
        it("should have interface", async function () {
            const { tokenListCallTest } = await loadFixture(deployTokenServiceFixture);
            await tokenListCallTest.registered();
            const tokens = await tokenListCallTest.findTokenList();
            console.log('tokens ', tokens);
            expect(tokens.length).to.equals(3);
            expect(tokens[2].tokenType).to.equals('ERC721');
        });
    });
});
