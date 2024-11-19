import { AbiParameter } from "viem";
import { FC, Fragment } from "react";
import { Box, Text } from "@mantine/core";
import { AbiInputParam, GenericFormAbiFunction } from "./types";

interface FunctionParamLabelProps {
    input: AbiParameter;
}

export const FunctionParamLabel: FC<FunctionParamLabelProps> = ({ input }) => {
    return (
        <Box display="inline">
            <Text c="cyan" span fz="sm">
                {input.type}
            </Text>{" "}
            <Text span fz="sm">
                {input.name}
            </Text>
        </Box>
    );
};

interface InputLabelProps {
    input: AbiParameter | AbiInputParam;
}

export const InputLabel: FC<InputLabelProps> = ({ input }) => {
    return (
        <>
            {input.name && input.type ? (
                <FunctionParamLabel input={input} />
            ) : (
                input.name || input.type
            )}
        </>
    );
};

interface FunctionSignatureProps {
    abiFunction: GenericFormAbiFunction;
}

export const FunctionSignature: FC<FunctionSignatureProps> = ({
    abiFunction,
}) => {
    return (
        <>
            <Text span fw="bold" fz="sm">
                {abiFunction.name}
            </Text>
            (
            {abiFunction.inputs.map((input, index) => (
                <Fragment key={input.id}>
                    <FunctionParamLabel input={input} />
                    {index < abiFunction.inputs.length - 1 ? ", " : ""}
                </Fragment>
            ))}
            )
        </>
    );
};
