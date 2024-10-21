import { FormSpecification } from "../../src/GenericInputForm/types";

export const formSpecificationAbiInputs = [
    {
        type: "uint256",
        name: "amount",
    },
    {
        type: "bool",
        name: "success",
    },
];

export const formSpecificationAbi = {
    inputs: formSpecificationAbiInputs,
    name: "create",
    outputs: [],
    stateMutability: "view",
    type: "function",
};

export const formSpecification = {
    id: "1",
    name: "Generated specification",
    abi: [formSpecificationAbi],
} as FormSpecification;

export const functionSignature = `function ${formSpecificationAbi.name}(${formSpecificationAbiInputs[0].type} ${formSpecificationAbiInputs[0].name}, ${formSpecificationAbiInputs[1].type} ${formSpecificationAbiInputs[1].name}) view returns (uint256)`;

export const abiParam = `${formSpecificationAbiInputs[0].type} ${formSpecificationAbiInputs[0].name}, ${formSpecificationAbiInputs[1].type} ${formSpecificationAbiInputs[1].name}`;
