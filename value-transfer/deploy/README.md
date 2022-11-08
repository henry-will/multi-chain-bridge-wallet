# This is for testing service chain value transfer.

## Bash environment variables in config/setting.env
- The *bridgeInfo* variable sets a bridge-info.json file. The bridge-info.json is located config directory. It was generated by [make-bridge-info.sh](../../servicechain-docker/bridge-info/make-bridge-info.sh) 
- The *parentBuildPath* variable sets the build directory where the bin and abi files are located. This build directory is for parent chain.
- The *childBuildPath* variable sets the build directory where the bin and abi files are located. This build directory is for child chain.
- The *deployBridgeConfig* variable sets a deploy-bridge.json file. This deploy-bridge.json file is automatically generated by deploy-contracts.sh.

## Node.js Version
- Used node version as v12.22.10
```shell
nvm use v12.22.10
yarn install
```

## Deploy bridge and token contracts
- The deploy/deploy-contracts.sh script executes scripts deploy-bridge-token-contract.js, erc20-airdrop.js and erc721-mint.js in sequence.
- deploy-bridge-token-contracts-deploy.js deploys bridge contract and token contract in parent chain and child chain. 
- erc20-airdrop.js send erc20 tokens to alice parent sender and bob child sender.
- erc721-mint.js mint erc721 tokens to alice parent sender and bob child sender.

```shell
cd value-transfer/deploy
sh deploy-contracts.sh
```
 
## Reference
This test is referencing [servicecin-value-transfer-examples](https://github.com/klaytn/servicechain-value-transfer-examples).