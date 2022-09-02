// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { AgoraDepositContract } from "../typechain-types";
import { BOACoin } from "../utils/Amount";
import { GasPriceManager } from "../utils/GasPriceManager";

import { utils, Wallet } from "ethers";
import { ethers } from "hardhat";

import { NonceManager } from "@ethersproject/experimental";

import fs from "fs";

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
    const ContractFactory = await ethers.getContractFactory("AgoraDepositContract");
    const contract = ContractFactory.attach(process.env.DEPOSIT_CONTRACT_ADDRESS || "") as AgoraDepositContract;
    const provider = ethers.provider;

    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const admin_signer = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

    const deposit_data = JSON.parse(fs.readFileSync("./validator_keys1/deposit_data-1661904389.json", "utf-8"));

    for (let idx = 0; idx < deposit_data.length; idx++) {
        console.log(`[${idx}] public key: ${deposit_data[idx].pubkey}`);

        await contract.connect(admin_signer).deposit_with_voter(
            prefix0X(deposit_data[idx].pubkey),
            prefix0X(deposit_data[idx].withdrawal_credentials),
            prefix0X(deposit_data[idx].signature),
            prefix0X(deposit_data[idx].deposit_data_root),
            {
                voter: prefix0X(deposit_data[idx].voter.substring(24)),
                signature: prefix0X(deposit_data[idx].voter_signature),
                data_root: prefix0X(deposit_data[idx].voter_data_root),
            },
            { from: admin.address, value: TX_VALUE }
        );

        if ((idx + 1) % 10 === 0) await delay(10000);
        else await delay(1000);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
