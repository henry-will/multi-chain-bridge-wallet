import { getDefaultProvider, ethers, BigNumber } from 'ethers';

import { BRIDGE_VALUE_TRANSFER_ABI } from './abi/bridge';
import { ERC20_VALUE_TRANSFER_ABI } from './abi/erc20';
import fs from 'fs';

const conf = JSON.parse(fs.readFileSync(process.env.deployBridgeConfig || './value-transfer/config/deploy-bridge.json', 'utf8'));

export const ERC20ValueTransfer = async (rpcUrl: string, bridgeAddress: string, tokenAddress: string, senderPrivateKey: string, receiver: string, amount: number, gasPrice: number) => {
    const provider = getDefaultProvider(rpcUrl);
    const signer = new ethers.Wallet(senderPrivateKey, provider)
    const sender = signer.address

    const bridgeContract = new ethers.Contract(bridgeAddress, BRIDGE_VALUE_TRANSFER_ABI, signer);
    console.log('bridgeContract', bridgeContract.address);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_VALUE_TRANSFER_ABI, signer);
    console.log('tokenContract', tokenContract.address);

    let totalSupply = await tokenContract.totalSupply();
    console.log('totalSupply', ethers.utils.formatUnits(totalSupply, 9), 'gwei');
    let balance: BigNumber = await tokenContract.balanceOf(sender);
    console.log(`Sender(before) ${sender}'s balance is ${balance}`);

    console.assert(balance.gte(BigNumber.from(amount)), `${sender}'s balance ${balance} is insufficient by ${amount} `);

    let tx = await tokenContract.approve(bridgeAddress, amount, {
        from: sender,
        gasPrice
    });
    let receipt = await tx.wait();
    // console.log('approve', receipt);

    tx = await bridgeContract.requestERC20Transfer(tokenAddress, receiver, amount, 0, [], {
        from: sender,
        gasPrice
    });
    receipt = await tx.wait();
    // console.log('receipt', receipt);

    balance = await tokenContract.balanceOf(sender);
    console.log(`Sender(after) ${sender}'s balance is ${balance}`);
}

export const getGasPrice = async (rpcUrl: string) => {
    const provider = getDefaultProvider(rpcUrl);

    let gasPrice: BigNumber = await provider.getGasPrice();
    console.log(`Base Gas Price is ${gasPrice}`);
    return gasPrice.toNumber();
}

export const getBalance = async (rpcUrl: string, account: string, senderPrivateKey: string, tokenAddress: string, direction: string) => {
    const provider = getDefaultProvider(rpcUrl);
    const signer = new ethers.Wallet(senderPrivateKey, provider)

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_VALUE_TRANSFER_ABI, signer);

    let balance: BigNumber = await tokenContract.balanceOf(account);
    console.log(`${direction} ${account}'s balance is ${balance}`);
    return balance.toNumber();
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function main() {
    const parent = {
        url: conf.url.parent,
        receiver: conf.receiver.parent,
        senderPrivateKey: conf.sender.parent,
        tokenAddress: conf.tokens[0].parent,
        bridgeAddress: conf.bridge.parent
    };
    const child = {
        url: conf.url.child,
        receiver: conf.receiver.child,
        senderPrivateKey: conf.sender.child,
        tokenAddress: conf.tokens[0].child,
        bridgeAddress: conf.bridge.child
    };


    const amount: number = 100;
    let beforeBalance: number = await getBalance(parent.url, parent.receiver, parent.senderPrivateKey, parent.tokenAddress, 'Parent Receiver(before)');
    console.log('Child -> Parent');
    let gasPrice: number = await getGasPrice(child.url);
    await ERC20ValueTransfer(child.url, child.bridgeAddress, child.tokenAddress, child.senderPrivateKey, parent.receiver, amount, gasPrice);
    // FIXME Need to know if the other chain has changed
    await sleep(3000);

    let afterBalance: number = await getBalance(parent.url, parent.receiver, parent.senderPrivateKey, parent.tokenAddress, 'Parent Receiver(after)');
    if ((beforeBalance + amount) !== afterBalance) {
        console.error("Error: send amount ", amount, " is not applied. before = ", beforeBalance, " after = ", afterBalance);
        process.exit(1);
    }

    console.log('Parent -> Child');

    beforeBalance = await getBalance(child.url, child.receiver, child.senderPrivateKey, child.tokenAddress, 'Child Receiver(before)');

    gasPrice = await getGasPrice(parent.url);
    await ERC20ValueTransfer(parent.url, parent.bridgeAddress, parent.tokenAddress, parent.senderPrivateKey, child.receiver, amount, gasPrice);

    afterBalance = await getBalance(child.url, child.receiver, child.senderPrivateKey, child.tokenAddress, 'Child Receiver(after)');
    if ((beforeBalance + amount) != afterBalance) {
        console.error("Error: send amount ", amount, " is not applied. before = ", beforeBalance, " after = ", afterBalance);
        process.exit(1);
    }
})();