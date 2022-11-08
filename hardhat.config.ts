import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        henry: {
            chainId: 1000,
            url: process.env.HENRY_URL || "",
            // 0x3e514cd52f16cfe9c992be8fb305c384236564ad
            accounts: ["0x1dd4dc19688dde6b519f3d305349fa7cbc6f5c4195e72e0d12b665b2bc39a3a1"],
            gasPrice: 0,
        },
        henry_docker: {
            chainId: 9999,
            url: process.env.HENRY_DOCKER_URL || "",
            accounts: ["0x1dd4dc19688dde6b519f3d305349fa7cbc6f5c4195e72e0d12b665b2bc39a3a1"],
        },
        baobab: {
            chainId: 1001,
            url: process.env.KLAYTN_URL || "",
            accounts: ["0x1dd4dc19688dde6b519f3d305349fa7cbc6f5c4195e72e0d12b665b2bc39a3a1"],
        },
    },
};

export default config;
