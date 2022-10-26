import * as dotenv from "dotenv";

import {HardhatUserConfig, task} from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const config: HardhatUserConfig = {
    
    // solidity: "0.8.17",
    solidity: {
        compilers: [
            {
                version: "0.5.6",
            },
            {
                version: "0.8.17",
                settings: {},
            },
        ],
    },
    // defaultNetwork: "mainbridge",
    networks: {
        mainbridge: {
            url: "http://127.0.0.1:8553",
            // chainId: 1000,
            // gas: 50000000,
            // gasPrice: 25000000000,
            accounts: {
                mnemonic: "test test test test test test test test test test test junk",
                initialIndex: 0,
            },
            // operator: '0x9388349e71140c1f099ca8293892ab0d1e151d4f',
            allowUnlimitedContractSize: true,
        },
        subbridge: {
            url: "http://127.0.0.1:8554",
            // chainId: 1001,
            // gas: 50000000,
            // gasPrice: 25000000000,
            accounts: {
                mnemonic: "test test test test test test test test test test test junk",
                initialIndex: 1,
            },
            // operator: '0xcb5e2874276d3a96ab6331cafeb80baa6453eeb0',
            allowUnlimitedContractSize: true,
        },
        hardhat: {
            accounts: {
                accountsBalance: '100000000000000000000000000',
            },
            allowUnlimitedContractSize: true,
        },
    },
};

export default config;
