#!/bin/bash

# deploy and register 
npx hardhat --network mainbridge run scripts/DeployParentChain.ts
npx hardhat --network subbridge run scripts/DeployChildChain.ts 
npx hardhat --network mainbridge run scripts/RegisterParentToken.ts
npx hardhat --network subbridge run scripts/RegisterChildToken.ts 

# VT need to execute the below command 
# npx hardhat --network mainbridge run scripts/TransferValue.ts