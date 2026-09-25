import {
    Button,
    Collapse,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
    useComputedColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type FC } from "react";
import { TbFile, TbFileText, TbTrophyFilled } from "react-icons/tb";
import type { Hex } from "viem";
import { content } from "../../content";
import { ClaimText } from "../ClaimText";
import { InfoHint } from "../InfoHint";
import type { Claim } from "../types";
import { ClaimTimelineItem } from "./ClaimTimelineItem";

export interface WinnerItemProps {
    /**
     * Winner claim
     */
    claim: Claim;

    /**
     * Current timestamp
     */
    now: number;

    /**
     * State-transition proof of a leaf step win. `null` when it cannot be
     * read; omitted when the win needs no proof.
     */
    proof?: Hex | null;

    /**
     * Timestamp
     */
    timestamp?: number;

    /**
     * Whether the timestamp is still being resolved.
     */
    timestampLoading?: boolean;
}

const text = content.match.proof;

export const WinnerItem: FC<WinnerItemProps> = (props) => {
    const { claim, now, proof, timestamp, timestampLoading } = props;

    const [opened, { toggle }] = useDisclosure(false);

    const theme = useMantineTheme();
    const gold = theme.colors.yellow[5];

    const scheme = useComputedColorScheme();
    const bg = scheme === "light" ? theme.colors.yellow[0] : undefined;

    return (
        <ClaimTimelineItem
            claim={claim}
            now={now}
            timestamp={timestamp}
            timestampLoading={timestampLoading}
        >
            <Paper withBorder p={16} radius="lg" bg={bg}>
                <Stack gap="xs">
                    <Group gap="xs">
                        <TbTrophyFilled size={24} color={gold} />
                        <ClaimText claim={claim} withIcon={false} />
                        {proof && (
                            <Button
                                variant="transparent"
                                rightSection={
                                    opened ? (
                                        <TbFile size={16} />
                                    ) : (
                                        <TbFileText size={16} />
                                    )
                                }
                                size="compact-xs"
                                onClick={toggle}
                            >
                                {text.viewTxt}
                            </Button>
                        )}
                        {proof === null && (
                            <Group gap={4}>
                                <Text size="xs" c="dimmed">
                                    {text.unavailableTxt}
                                </Text>
                                <InfoHint label={text.unavailableHint} />
                            </Group>
                        )}
                    </Group>
                    {proof && (
                        <Collapse in={opened}>
                            <Textarea
                                readOnly
                                rows={10}
                                autosize
                                maxRows={10}
                                value={proof}
                            />
                        </Collapse>
                    )}
                </Stack>
            </Paper>
        </ClaimTimelineItem>
    );
};
