// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { BigNumber, Wallet } from "ethers";

import fs from "fs";
import { BOACoin } from "../utils/Amount";
// tslint:disable-next-line:no-var-requires
const { toChecksumAddress } = require("ethereum-checksum-address");
function prefix0X(key: string): string {
    return `0x${key}`;
}
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

async function main() {
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

    const result = {
        proposer_config: {},
        default_config: {
            fee_recipient: undefined,
        },
    };

    for (const deposit of deposit_data) {
        // @ts-ignore
        result.proposer_config[prefix0X(deposit.pubkey)] = {
            fee_recipient: toChecksumAddress(prefix0X(deposit.voter.substring(24))),
        };
    }
    // @ts-ignore
    result.default_config.fee_recipient = toChecksumAddress(prefix0X(deposit_data[0].voter.substring(24)));
    console.log(JSON.stringify(result));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
