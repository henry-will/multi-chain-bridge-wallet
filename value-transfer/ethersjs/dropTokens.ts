import { getDefaultProvider, ethers, BigNumber, BigNumberish, Wallet, providers } from 'ethers';

import { ERC20_VALUE_TRANSFER_ABI } from './abi/erc20';
import fs from 'fs';

const conf = JSON.parse(fs.readFileSync(process.env.deployBridgeConfig || './value-transfer/config/deploy-bridge.json', 'utf8'));

async function sendCurrenry(provider: providers.BaseProvider, signer: Wallet, sender: string, receiver: string, amount: BigNumber, gasPrice: BigNumber, gasLimit: BigNumber) {
    let senderBalance = await provider.getBalance(sender);
    console.log(`Before ${sender}'s balance is ${ethers.utils.formatUnits(senderBalance, 9)}}`);
    let receiverBalance = await provider.getBalance(receiver);
    console.log(`Before ${receiver}'s balance is ${ethers.utils.formatUnits(receiverBalance, 9)}}`);

    const tx = {
        from: sender,
        to: receiver,
        value: amount,
        nonce: provider.getTransactionCount(
            sender,
            "latest"
        ),
        gasLimit: ethers.utils.hexlify(gasLimit),
        gasPrice: gasPrice,
    };
    console.dir(tx);
    const receipt = await signer.sendTransaction(tx);
    await receipt.wait();

    senderBalance = await provider.getBalance(sender);
    console.log(`After ${sender}'s balance is ${ethers.utils.formatUnits(senderBalance, 9)}}`);
    receiverBalance = await provider.getBalance(receiver);
    console.log(`After ${receiver}'s balance is ${ethers.utils.formatUnits(receiverBalance, 9)}}`);
}

(async function main() {
    const parent = {
        url: conf.url.parent,
        receiver: conf.receiver.parent,
        contractOwnerKey: conf.contractOwner.parent,
        tokenAddress: conf.tokens[0].parent,
        bridgeAddress: conf.bridge.parent
    };
    const child = {
        url: conf.url.child,
        receiver: conf.receiver.child,
        contractOwnerKey: conf.contractOwner.child,
        tokenAddress: conf.tokens[0].child,
        bridgeAddress: conf.bridge.child
    };

    // 
    const target = parent;
    const receiver = '0xD8367a6F4286d354A524DFeD73Ec29E65DB8d68a';
    const amount: BigNumber = ethers.utils.parseUnits('1.0', 17);
    const gasLimit = ethers.utils.parseUnits('1.0', 15);
    // 

    const provider = getDefaultProvider(target.url);
    const signer = new ethers.Wallet(target.contractOwnerKey, provider)
    const sender = signer.address

    // gas price
    let gasPrice: BigNumber = await provider.getGasPrice();
    console.log(`Base Gas Price is ${gasPrice}`);

    // send gas
    await sendCurrenry(provider, signer, sender, receiver, amount, gasPrice, gasLimit);

    const tokenContract = new ethers.Contract(target.tokenAddress, ERC20_VALUE_TRANSFER_ABI, signer);

    let senderBalance: BigNumber = await tokenContract.balanceOf(sender);
    console.log(`${sender}'s balance is ${ethers.utils.formatUnits(senderBalance, 9)}`);

    let beforeBalance: BigNumber = await tokenContract.balanceOf(receiver);
    console.log(`${receiver}'s balance is ${ethers.utils.formatUnits(beforeBalance, 9)}`);


    // transfer
    const tx = await tokenContract.transfer(receiver, amount, { from: sender, gasPrice, gasLimit: ethers.utils.hexlify(gasLimit) });
    await tx.wait();

    let afterBalance: BigNumber = await tokenContract.balanceOf(receiver);
    console.log(`${receiver}'s balance is ${ethers.utils.formatUnits(afterBalance, 9)}`);

    if (!(beforeBalance.add(amount).eq(afterBalance))) {
        console.error("Error: send amount ", amount, " is not applied. before = ", beforeBalance, " after = ", afterBalance, 'expected', beforeBalance.add(amount));
        process.exit(1);
    }
})();
