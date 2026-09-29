import {
    ActionIcon,
    Badge,
    Group,
    SegmentedControl,
    Tooltip,
    useMantineTheme,
    type TooltipProps,
} from "@mantine/core";
import type { FC, ReactNode } from "react";
import {
    TbPlayerPauseFilled,
    TbPlayerPlayFilled,
    TbPlayerTrackNextFilled,
    TbRepeat,
    TbRestore,
} from "react-icons/tb";
import { content } from "../../content";

const text = content.mock;

const mockSpeeds = [1, 10, 60] as const;

export type MockNodeControlsProps = {
    head: bigint;
    playing: boolean;
    /** Blocks produced every block time while playing; picking one plays. */
    speed: number;
    /** Scenario of the application in view, when it can be replayed. */
    replayable?: string;
    onPlay: () => void;
    onPause: () => void;
    onSpeedChange: (speed: number) => void;
    onStep: () => void;
    onReplay: () => void;
    onReset: () => void;
};

/** Tooltips above the header the toolbar sits in. */
const ToolbarTooltip: FC<TooltipProps> = (props) => {
    const theme = useMantineTheme();
    return <Tooltip withArrow zIndex={theme.other.zIndexSM} {...props} />;
};

const Control: FC<{
    label: string;
    onClick: () => void;
    children: ReactNode;
}> = ({ label, onClick, children }) => (
    <ToolbarTooltip label={label}>
        <ActionIcon variant="subtle" aria-label={label} onClick={onClick}>
            {children}
        </ActionIcon>
    </ToolbarTooltip>
);

export const MockNodeControls: FC<MockNodeControlsProps> = (props) => {
    const { head, playing, speed, replayable } = props;

    return (
        <Group gap={4} wrap="nowrap">
            <ToolbarTooltip label={text.headHint} multiline w={240}>
                <Badge variant="light" tt="none">
                    {`${text.blockTxt} ${head.toLocaleString("en-US")}`}
                </Badge>
            </ToolbarTooltip>
            {playing ? (
                <Control label={text.pauseTxt} onClick={props.onPause}>
                    <TbPlayerPauseFilled />
                </Control>
            ) : (
                <Control label={text.playTxt} onClick={props.onPlay}>
                    <TbPlayerPlayFilled />
                </Control>
            )}
            <Control label={text.stepTxt} onClick={props.onStep}>
                <TbPlayerTrackNextFilled />
            </Control>
            <ToolbarTooltip label={text.speedTxt}>
                <SegmentedControl
                    size="xs"
                    aria-label={text.speedTxt}
                    value={playing ? `${speed}` : ""}
                    data={mockSpeeds.map((value) => ({
                        value: `${value}`,
                        label: `${value}×`,
                    }))}
                    onChange={(value) => props.onSpeedChange(Number(value))}
                />
            </ToolbarTooltip>
            {replayable && (
                <Control label={text.replayTxt} onClick={props.onReplay}>
                    <TbRepeat />
                </Control>
            )}
            <Control label={text.resetTxt} onClick={props.onReset}>
                <TbRestore />
            </Control>
        </Group>
    );
};
