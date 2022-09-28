// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { WellKnownKey } from "../utils/WellKnownKey";

import { BigNumber, Wallet } from "ethers";

import fs from "fs";
import { BOACoin } from "../utils/Amount";

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

async function main() {
    const MAX_VALIDATOR = 1024;
    const validators: IValidator[] = [];
    for (let idx = 0; idx < MAX_VALIDATOR; idx++) {
        const wallet = new Wallet(WellKnownKey.keys[idx]);
        validators.push({
            private_key: wallet.privateKey,
            address: wallet.address,
            deposit_data: [],
        });
    }

    const deposit_data: IDepositData[] = [];
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys1/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys2/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys3/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys4/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys5/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys6/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys7/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys8/deposit_data.json", "utf-8")));
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys9/deposit_data.json", "utf-8")));

    for (let idx = 0; idx < deposit_data.length; idx++) {
        const m = deposit_data[idx];
        const n = Math.floor(Math.random() * (MAX_VALIDATOR - (MAX_VALIDATOR * idx) / deposit_data.length));
        validators[n].deposit_data.push(m);
    }
    const validators2 = validators.filter((m) => m.deposit_data.length > 0);
    let length = 0;
    let count = 0;
    let amount: BigNumber = BigNumber.from(0);
    for (const validator of validators2) {
        const amount1 = BOACoin.make("40000.02").value.mul(BigNumber.from(validator.deposit_data.length));
        amount = amount.add(amount1);
        if (validator.deposit_data.length > 0) count++;
        length += validator.deposit_data.length;
    }
    console.log("number of validators : ", validators2.length);
    console.log("effective number of validators : ", count);
    console.log("amount : ", new BOACoin(amount).toBOAString());

    console.log(JSON.stringify(validators2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
