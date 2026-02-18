import { Flex, Group, Text, Tooltip, type TooltipProps } from "@mantine/core";
import { type FC } from "react";
import { TbHelp } from "react-icons/tb";

interface Props {
    label: string;
    tooltipLabel: string;
    tooltipProps?: Partial<Omit<TooltipProps, "label">>;
}

/**
 *
 * Component to be used in conjuction with Mantine input type components
 * to be passed as the Label value when besides description a tooltip is
 * also desired.
 */
const LabelWithTooltip: FC<Props> = ({ label, tooltipLabel, tooltipProps }) => {
    const toolProps = tooltipProps ?? {};
    return (
        <Group justify="flex-start" gap="3">
            <Text size="sm">{label}</Text>
            <Tooltip
                multiline
                label={tooltipLabel}
                withArrow
                w="300"
                {...toolProps}
            >
                <Flex direction="column-reverse">
                    <TbHelp />
                </Flex>
            </Tooltip>
        </Group>
    );
};

export default LabelWithTooltip;
