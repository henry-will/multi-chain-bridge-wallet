
import { ethers } from 'hardhat';
import Caver from 'caver-js';

export async function getOwnerAndGasPrice(url: string, privateKey: string) {
    const provider = new ethers.providers.JsonRpcProvider(url);
    const owner = new ethers.Wallet(privateKey, provider)
    const gasPrice = await provider.getGasPrice()
    console.log(`${url} gas price is ${gasPrice}`);
    return { owner, gasPrice };
}
export function getCaverAndUnlockedPublicKey(url: string, publicKey: string, privateKey: string) {
    const caver = new Caver(url);
    const keyring = new caver.wallet.keyring.singleKeyring(publicKey, privateKey);
    const account = caver.wallet.add(keyring).address;
    return { caver, account };
}