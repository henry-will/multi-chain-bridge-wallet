# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

### Use node v16
Install nvm
```shell
nvm install v16.13.1
nvm use v16.13.1
```

### Use Yarn and run test
Install yarn 

```shell
yarn hardhat test test/ServiceNetworkTest.ts
yarn hardhat test test/ServiceBridgeTest.ts
```

Try running some of the following tasks:
```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
