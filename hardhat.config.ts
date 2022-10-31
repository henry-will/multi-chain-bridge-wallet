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
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        mainbridge: {
            url: "http://127.0.0.1:8553",
            chainId: 1000,
            gas: 30000000,
            gasPrice: 0,
            accounts:[
                '0xb79333fd93bd5f5c3a9f791f2d9ce0e3a92570d8a0c1bef0db5316d845b25784',
                '0x4b07ca7412ad2bb0e62db30369b9f08a8724fb81fce4b3b1af23800233074fbf',
                '0xc544b44c1c58955af516c1f2ff17f8fd522604f1ea6b64db79e067343ed5e307',
                ], 
            // accounts: {
            //     mnemonic: "test test test test test test test test test test test junk",
            //     initialIndex: 0,
            // },
            // operator: '0x9388349e71140c1f099ca8293892ab0d1e151d4f',
            allowUnlimitedContractSize: true,
        },
        subbridge: {
            url: "http://127.0.0.1:8554",
            chainId: 1001,
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
