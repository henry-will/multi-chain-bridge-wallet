#!/bin/bash

# deploy and register 
npx hardhat --network mainbridge run scripts/DeployParent.ts
npx hardhat --network subbridge  run scripts/DeployChild.ts 
npx hardhat --network mainbridge run scripts/RegisterParent.ts
npx hardhat --network subbridge  run scripts/RegisterChild.ts 

# VT need to execute the below command 
# npx hardhat --network mainbridge run scripts/TransferValue.ts