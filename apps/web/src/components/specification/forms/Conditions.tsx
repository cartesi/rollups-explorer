import { Group, Stack, Switch, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC } from "react";

export const Conditions: FC = () => {
    const [checked, { toggle }] = useDisclosure(false);

    return (
        <Stack>
            <Group justify="space-between" align="normal" wrap="nowrap">
                <Stack gap={0}>
                    <Text component="span" fw="bold">
                        Add Conditions
                    </Text>
                    <Text size="xs" c="dimmed" component="span">
                        Conditionals are to auto-apply the specification on an
                        input.
                    </Text>
                </Stack>
                <Switch checked={checked} onClick={toggle} />
            </Group>
        </Stack>
    );
};
