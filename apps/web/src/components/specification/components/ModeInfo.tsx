import { Alert, Anchor, Box, Group, Text } from "@mantine/core";
import { FC, ReactNode } from "react";
import { TbAlertCircle, TbExternalLink } from "react-icons/tb";
import { Modes } from "../types";

const modeInfo: Record<Modes, ReactNode> = {
    json_abi: (
        <Text>
            Use human readable ABI format to generate a full fledged JSON-ABI
            and decode standard ABI encoded data (i.e. 4 byte selector &
            arguments).{" "}
            <Anchor
                href="https://abitype.dev/api/human"
                target="_blank"
                display="inline-block"
            >
                <Group gap={2} component="span">
                    Human-readable ABI
                    <Box component="span" pt="4px">
                        <TbExternalLink />
                    </Box>
                </Group>
            </Anchor>
        </Text>
    ),
    abi_params: (
        <Text>
            The set of ABI parameters to decode against data, in the shape of
            the inputs or outputs attribute of an ABI event/function. These
            parameters must include valid{" "}
            <Anchor
                href="https://docs.soliditylang.org/en/v0.8.25/abi-spec.html#types"
                target="blank"
                display="inline-block"
            >
                <Group gap={2} component="span">
                    ABI types
                    <Box component="span" pt="4px">
                        <TbExternalLink />
                    </Box>
                </Group>
            </Anchor>
        </Text>
    ),
};

export const SpecificationModeInfo: FC<{ mode: Modes }> = ({ mode }) => {
    return (
        <Alert
            variant="light"
            color="blue"
            icon={<TbAlertCircle />}
            data-testid={`specification-mode-info`}
        >
            {modeInfo[mode]}
        </Alert>
    );
};
