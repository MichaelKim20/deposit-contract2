// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { AgoraDepositContract } from "../typechain-types";
import { BOACoin } from "../utils/Amount";
import { GasPriceManager } from "../utils/GasPriceManager";

import { BigNumber } from "ethers";
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

const pricePerValidator = 40000;
const TX_VALUE = BOACoin.make(pricePerValidator).value;

function prefix0X(key: string): string {
    return `0x${key}`;
}

function delay(interval: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, interval);
    });
}

async function main() {
    const validators: IValidator[] = JSON.parse(fs.readFileSync("./scripts/validators.json", "utf-8"));

    let length = 0;
    let count = 0;
    let amount: BigNumber = BigNumber.from(0);
    for (const validator of validators) {
        const amount1 = BOACoin.make("40000.02").value.mul(BigNumber.from(validator.deposit_data.length));
        amount = amount.add(amount1);
        if (validator.deposit_data.length > 0) count++;
        length += validator.deposit_data.length;
    }
    console.log("number of validators : ", validators.length);
    console.log("effective number of validators : ", count);
    console.log("amount : ", new BOACoin(amount).toBOAString());

    const provider = ethers.provider;
    const ContractFactory = await ethers.getContractFactory("AgoraDepositContract");
    const contract = ContractFactory.attach(process.env.DEPOSIT_CONTRACT_ADDRESS || "") as AgoraDepositContract;

    // send deposit amount
    let deposit_idx = 0;
    let validator_idx = 0;
    for (const validator of validators) {
        const validator_signer = new NonceManager(new GasPriceManager(provider.getSigner(validator.address)));
        for (let idx = 0; idx < validator.deposit_data.length; idx++) {
            console.log(
                `[${validator_idx} : ${deposit_idx} / ${length}] public key: ${validator.deposit_data[idx].pubkey}`
            );

            await contract.connect(validator_signer).deposit_with_voter(
                prefix0X(validator.deposit_data[idx].pubkey),
                prefix0X(validator.deposit_data[idx].withdrawal_credentials),
                prefix0X(validator.deposit_data[idx].signature),
                prefix0X(validator.deposit_data[idx].deposit_data_root),
                {
                    voter: prefix0X(validator.deposit_data[idx].voter.substring(24)),
                    signature: prefix0X(validator.deposit_data[idx].voter_signature),
                    data_root: prefix0X(validator.deposit_data[idx].voter_data_root),
                },
                { from: validator.address, value: TX_VALUE }
            );
            if ((deposit_idx + 1) % 10 === 0) await delay(10000);
            else await delay(1000);
            deposit_idx++;
        }
        validator_idx++;
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
