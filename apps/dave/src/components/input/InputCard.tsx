import type { Input, InputStatus } from "@cartesi/viem";
import {
    Badge,
    Card,
    Group,
    ScrollArea,
    SegmentedControl,
    Select,
    Spoiler,
    Stack,
    Text,
    Tooltip,
    type MantineColor,
} from "@mantine/core";
import { Activity, useMemo, useState, type FC } from "react";
import { TbReceipt } from "react-icons/tb";
import useRightColorShade from "../../hooks/useRightColorShade";
import { getDecoder } from "../../lib/decoders";
import Address from "../Address";
import { PrettyTime } from "../PrettyTime";
import TransactionHash from "../TransactionHash";
import { OutputList } from "../output/OutputList";
import { ReportList } from "../report/ReportList";
import { contentDisplayOptions, type DecoderType } from "../types";

interface Props {
    input: Input;
}

const getStatusColor = (status: InputStatus): MantineColor => {
    switch (status) {
        case "NONE":
            return "gray";
        case "ACCEPTED":
            return "green";
        default:
            return "red";
    }
};

type ViewControl = "payload" | "output" | "report";

const maxHeight = 450;
const iconSize = 21;
// TODO: Define what else will be inside like payload (decoding etc)
export const InputCard: FC<Props> = ({ input }) => {
    const statusColor = useRightColorShade(getStatusColor(input.status));
    const [viewControl, setViewControl] = useState<ViewControl>("payload");
    const [decoderType, setDecoderType] = useState<DecoderType>("raw");
    const decoderFn = useMemo(() => getDecoder(decoderType), [decoderType]);
    const millis = Number(input.decodedData.blockTimestamp * 1000n);

    return (
        <Card shadow="md" withBorder>
            <Card.Section withBorder inheritPadding py="sm">
                <Group justify="space-between">
                    <Address value={input.decodedData.sender} icon shorten />
                    <Group>
                        <Text fw="bold"># {input.index}</Text>
                        <Activity
                            mode={
                                input.status !== "ACCEPTED"
                                    ? "visible"
                                    : "hidden"
                            }
                        >
                            <Badge color={statusColor}>{input.status}</Badge>
                        </Activity>
                    </Group>
                </Group>
            </Card.Section>
            <Stack py="sm" px="0" mx="0" mah={maxHeight}>
                <Group>
                    <SegmentedControl
                        transitionDuration={300}
                        transitionTimingFunction="ease"
                        value={viewControl}
                        onChange={(value) =>
                            setViewControl(value as ViewControl)
                        }
                        data={[
                            { value: "payload", label: "Payload" },
                            { value: "output", label: "Output" },
                            { value: "report", label: "Report" },
                        ]}
                    />
                    <Select
                        id="decoder-type-select"
                        w="100"
                        allowDeselect={false}
                        data={contentDisplayOptions}
                        value={decoderType}
                        onChange={(value) =>
                            setDecoderType(value as DecoderType)
                        }
                    />
                </Group>

                <ScrollArea.Autosize
                    mah={maxHeight}
                    type="scroll"
                    scrollbars="y"
                    offsetScrollbars
                >
                    <Activity
                        mode={viewControl === "payload" ? "visible" : "hidden"}
                    >
                        <Spoiler
                            maxHeight={80}
                            showLabel="Show more"
                            hideLabel="Show less"
                        >
                            <Text style={{ wordBreak: "break-all" }}>
                                {decoderFn(input.decodedData.payload)}
                            </Text>
                        </Spoiler>
                    </Activity>

                    <Activity
                        mode={viewControl === "output" ? "visible" : "hidden"}
                    >
                        <OutputList
                            application={input.decodedData.applicationContract}
                            inputIndex={input.index}
                            epochIndex={input.epochIndex}
                            decoderType={decoderType}
                            limit={1}
                        />
                    </Activity>

                    <Activity
                        mode={viewControl === "report" ? "visible" : "hidden"}
                    >
                        <ReportList
                            application={input.decodedData.applicationContract}
                            inputIndex={input.index}
                            epochIndex={input.epochIndex}
                            decoderType={decoderType}
                        />
                    </Activity>
                </ScrollArea.Autosize>
            </Stack>
            <Card.Section inheritPadding withBorder py="sm">
                <Group gap="xs" justify="space-between">
                    <Group gap={3}>
                        <Tooltip label="Transaction hash">
                            <TbReceipt size={iconSize} />
                        </Tooltip>
                        <TransactionHash
                            transactionHash={input.transactionReference}
                        />
                    </Group>

                    <PrettyTime
                        milliseconds={millis}
                        displayTimestampUTC
                        size="xs"
                    />
                </Group>
            </Card.Section>
        </Card>
    );
};
