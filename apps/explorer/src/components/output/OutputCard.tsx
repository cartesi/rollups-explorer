import type { Application, Output } from "@cartesi/viem";
import {
    Anchor,
    Card,
    Group,
    SegmentedControl,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useState, type FC } from "react";
import { TbClock, TbMail } from "react-icons/tb";
import { pathBuilder } from "../../routes/routePathBuilder";
import { contentDisplayOptions, type DecoderType } from "../types";
import { OutputView } from "./OutputView";

export interface OutputCardProps {
    output: Output;
    application: Application;
}

const displayOptions = contentDisplayOptions.map((option) => ({
    value: option.value,
    label: option.label,
}));

export const OutputCard: FC<OutputCardProps> = ({ output, application }) => {
    const theme = useMantineTheme();
    const [decoderType, setDecoderType] = useState<DecoderType>("raw");

    return (
        <Card id={`output-${output.index}`}>
            <Card.Section withBorder inheritPadding py="sm">
                <Group justify="flex-end">
                    <Group>
                        <Text fw="bold"># {output.index}</Text>
                    </Group>
                </Group>
            </Card.Section>
            <Stack py="sm">
                <Group>
                    <SegmentedControl
                        transitionDuration={300}
                        transitionTimingFunction="ease"
                        fullWidth={false}
                        value={decoderType}
                        data={displayOptions}
                        onChange={(value) =>
                            setDecoderType(value as DecoderType)
                        }
                    />
                </Group>
                <OutputView
                    application={application.applicationAddress}
                    key={`${output.epochIndex}-${output.inputIndex}-${output.index}`}
                    output={output}
                    displayAs={decoderType}
                />
            </Stack>
            <Card.Section inheritPadding withBorder py="sm">
                <Group gap="xs" justify="space-between">
                    <Group gap={3}>
                        <TbMail size={theme.other.mdIconSize} />
                        <Text c="dimmed">Input #{output.inputIndex}</Text>
                    </Group>
                    <Group gap={3}>
                        <TbClock size={theme.other.mdIconSize} />
                        <Anchor
                            component={Link}
                            href={pathBuilder.epoch({
                                application:
                                    application.name ??
                                    application.applicationAddress,
                                epochIndex: output.epochIndex,
                            })}
                            prefetch={true}
                        >
                            <Text>Epoch #{output.epochIndex}</Text>
                        </Anchor>
                    </Group>
                </Group>
            </Card.Section>
        </Card>
    );
};
