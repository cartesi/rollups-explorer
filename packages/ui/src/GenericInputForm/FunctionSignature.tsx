import { AbiFunction, AbiParameter } from "viem";
import { FC, Fragment } from "react";
import { Box, Text } from "@mantine/core";

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

interface FunctionSignatureProps {
    abiFunction: AbiFunction;
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
                <Fragment key={`${input.type}-${input.name}`}>
                    <FunctionParamLabel input={input} />
                    {index < abiFunction.inputs.length - 1 ? ", " : ""}
                </Fragment>
            ))}
            )
        </>
    );
};
