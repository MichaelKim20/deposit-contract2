// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

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
    idx?: number;
}

interface IValidator {
    private_key: string;
    address: string;
    deposit_data: IDepositData[];
}

async function main() {
    const deposit_data: IDepositData[] = [];
    deposit_data.push(...JSON.parse(fs.readFileSync("./validator_keys1/deposit_data.json", "utf-8")));

    const size = 100;
    let page = 0;
    for (let idx = 0; idx < deposit_data.length; idx += size) {
        const dataset = [];
        for (let idx2 = 0; idx2 < size && idx + idx2 < deposit_data.length; idx2++) {
            deposit_data[idx + idx2].idx = idx + idx2;
            dataset.push(deposit_data[idx + idx2]);
        }
        fs.writeFileSync(`./validator_keys1/deposit_data_sub${page++}.json`, JSON.stringify(dataset));
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
