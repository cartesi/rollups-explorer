import { AbiFunction } from "viem";
import { FC, Fragment } from "react";
import { Text } from "@mantine/core";
import { FunctionParamLabel } from "./FunctionParamLabel";

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
