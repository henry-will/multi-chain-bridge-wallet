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
                // private key of signer for deploy in parent chain
                '0xb79333fd93bd5f5c3a9f791f2d9ce0e3a92570d8a0c1bef0db5316d845b25784',
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
            chainId: 2000,
            gas: 30000000,
            gasPrice: 0,
            // gas: 50000000,
            // gasPrice: 25000000000,
            accounts:[
                // private key of signer for deploy in child chain 
                '0x7d621cc7cac4a95adf52f7e5be05c06945ecd967f84242fbd9271da2f611a7d9',
                ], 
            // accounts: {
            //     mnemonic: "test test test test test test test test test test test junk",
            //     initialIndex: 1,
            // },
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
