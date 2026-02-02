import type { ListOutputsParams } from "@cartesi/viem";
import { useOutputs } from "@cartesi/wagmi";
import { Card, Center, Group, Pagination, Stack, Text } from "@mantine/core";
import { Activity, useState, type FC } from "react";
import type { DecoderType } from "../types";
import { Output } from "./Output";

interface OutputListProps extends ListOutputsParams {
    decoderType?: DecoderType;
}

const NoOutputs = () => (
    <Center>
        <Text c="dimmed" size="xl">
            No outputs generated
        </Text>
    </Center>
);

export const OutputList: FC<OutputListProps> = ({
    application,
    descending = true,
    inputIndex,
    epochIndex,
    limit = 50,
    outputType,
    offset = 0,
    voucherAddress,
    decoderType = "raw",
}) => {
    const [newOffSet, setNewOffset] = useState<number>(offset);
    const {
        data: result,
        isLoading,
        error,
        isError,
    } = useOutputs({
        application,
        epochIndex,
        inputIndex,
        outputType,
        voucherAddress,
        limit,
        offset: newOffSet,
        descending,
    });

    if (isLoading) {
        return (
            <Card>
                <Center>
                    <Text c="dimmed">Checking for outputs...</Text>
                </Center>
            </Card>
        );
    }

    if (isError) {
        console.error(error.message);
        return (
            <Card>
                <Center>
                    <Text c="red">Could not fetch the outputs</Text>
                </Center>
            </Card>
        );
    }

    if (!result || result.data.length === 0) {
        return <NoOutputs />;
    }

    const hasMoreThanOne = result.pagination.totalCount;

    return (
        <Stack id="output-list" gap={0}>
            <Activity mode={hasMoreThanOne ? "visible" : "hidden"}>
                <Group justify="flex-end">
                    <Pagination
                        total={result.pagination.totalCount}
                        value={newOffSet + 1}
                        onChange={(value) => {
                            if (value !== newOffSet + 1) {
                                setNewOffset(value - 1);
                            } else {
                                console.log(`Clicked same number ${value}`);
                            }
                        }}
                    />
                </Group>
            </Activity>
            {result.data.map((output) => (
                <Output
                    key={`${output.epochIndex}-${output.inputIndex}-${output.index}`}
                    output={output}
                    displayAs={decoderType}
                />
            ))}
        </Stack>
    );
};
