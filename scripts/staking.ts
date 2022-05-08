// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { DepositContract } from "../typechain";

import { BigNumber, utils, Wallet } from "ethers";
import { ethers } from "hardhat";

import fs from "fs";

export interface SendOptions {
    from: string;
    gasPrice?: string;
    gas?: number;
    value?: number | string | BigNumber;
}

const pricePerValidator = BigNumber.from(32);
const TX_VALUE = pricePerValidator.mul(BigNumber.from(10).pow(18));

function prefix0X(key: string): string {
    return `0x${key}`;
}

async function main() {
    const contractArtifact = JSON.parse(
        fs.readFileSync("./artifacts/contracts/deposit_contract.sol/DepositContract.json", "utf8")
    );
    const provider = ethers.provider;
    const contract = new ethers.Contract(
        process.env.DEPOSIT_CONTRACT_ADDRESS || "",
        contractArtifact.abi,
        provider
    ) as DepositContract;

    const user = new Wallet(process.env.USER_KEY || "");
    const user_signer = provider.getSigner(user.address);
    const deposit_data = JSON.parse(fs.readFileSync("./validator_keys/deposit_data-1651561659.json", "utf-8"));
    for (const elem of deposit_data) {
        console.log("pubkey: " + elem.pubkey);
        console.log("withdrawal_credentials: " + elem.withdrawal_credentials);
        console.log("amount: " + elem.amount);
        console.log("signature: " + elem.signature);
        console.log("deposit_data_root: " + elem.deposit_data_root);

        await contract.connect(user_signer).deposit(
            prefix0X(elem.pubkey),
            prefix0X(elem.withdrawal_credentials),
            prefix0X(elem.signature),
            prefix0X(elem.deposit_data_root),
        {from: user.address, value: TX_VALUE}
        );
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});