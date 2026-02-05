import type { Input } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { InputCard } from "./InputCard";

interface Props {
    inputs: Input[];
}

export const InputList: FC<Props> = ({ inputs }) => {
    return (
        <Stack gap="xs" pb="md">
            {inputs.map((input) => (
                <InputCard input={input} key={input.index} />
            ))}
        </Stack>
    );
};
