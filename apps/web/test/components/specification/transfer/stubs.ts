import { VALIDATOR_VERSIONS } from "../../../../src/components/specification/transfer/validator";
import {
    SPECIFICATION_TRANSFER_NAME,
    SpecificationTransfer,
} from "../../../../src/components/specification/types";
import { AbiType } from "abitype";

export const generateInvalidVersion = (max = Number.MAX_SAFE_INTEGER) => {
    let randomVersion;

    do {
        randomVersion = Math.floor(Math.random() * max);
    } while (VALIDATOR_VERSIONS.includes(randomVersion.toString()));

    return randomVersion;
};

export const defaultSpecification: SpecificationTransfer = {
    version: 1,
    timestamp: new Date().getTime(),
    name: SPECIFICATION_TRANSFER_NAME,
    specifications: [
        {
            conditionals: [
                {
                    conditions: [
                        {
                            field: "application.id",
                            operator: "equals",
                            value: "0x60a7048c3136293071605a4eaffef49923e981cc",
                        },
                    ],
                    logicalOperator: "or",
                },
            ],
            timestamp: 1724239104387,
            version: 1,
            name: "My first JSON ABI spec",
            id: "1724239104387",
            mode: "json_abi",
            abi: [
                {
                    name: "balanceOf",
                    type: "function",
                    stateMutability: "view",
                    inputs: [
                        {
                            type: "address",
                            name: "owner",
                        },
                    ],
                    outputs: [
                        {
                            type: "uint256",
                        },
                    ],
                },
            ],
        },
        {
            conditionals: [
                {
                    conditions: [
                        {
                            field: "application.id",
                            operator: "equals",
                            value: "0x60a7048c3136293071605a4eaffef49923e981cc",
                        },
                    ],
                    logicalOperator: "or",
                },
            ],
            timestamp: 1724239104388,
            version: 1,
            name: "My first ABI Params spec",
            id: "1724239104388",
            mode: "abi_params",
            abiParams: ["address to, uint256 amount, bool succ"],
            sliceInstructions: [
                {
                    from: 0,
                    to: 20,
                    name: "amount",
                    type: "unit" as AbiType,
                },
            ],
            sliceTarget: "amount",
        },
    ],
};
