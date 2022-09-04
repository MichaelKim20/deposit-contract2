// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { BOACoin } from "../utils/Amount";
import { GasPriceManager } from "../utils/GasPriceManager";

import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";

import { NonceManager } from "@ethersproject/experimental";

import fs from "fs";

interface IDepositData {
    pubkey: string;
    withdrawal_credentials: string;
    amount: number;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    voter: string;
    voter_data_root: string;
    voter_signature: string;
    fork_version: string;
    network_name: string;
    deposit_cli_version: string;
}

interface IValidator {
    private_key: string;
    address: string;
    deposit_data: IDepositData[];
}

function delay(interval: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, interval);
    });
}

async function main() {
    const validators: IValidator[] = JSON.parse(fs.readFileSync("./scripts/validators.json", "utf-8"));

    let count = 0;
    let amount: BigNumber = BigNumber.from(0);
    for (const validator of validators) {
        const amount1 = BOACoin.make("40000.02").value.mul(BigNumber.from(validator.deposit_data.length));
        amount = amount.add(amount1);
        if (validator.deposit_data.length > 0) count++;
    }
    console.log("number of validators : ", validators.length);
    console.log("effective number of validators : ", count);
    console.log("amount : ", new BOACoin(amount).toBOAString());

    const provider = ethers.provider;
    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const admin_signer = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

    // send deposit amount
    let validator_idx = 0;
    for (const validator of validators) {
        console.log(`[${validator_idx} / ${validators.length}] address: ${validator.address}`);

        await admin_signer.sendTransaction({
            to: validator.address,
            value: BOACoin.make("40000.02").value.mul(BigNumber.from(validator.deposit_data.length)),
        });
        if ((validator_idx + 1) % 10 === 0) await delay(10000);
        else await delay(1000);
        validator_idx++;
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
