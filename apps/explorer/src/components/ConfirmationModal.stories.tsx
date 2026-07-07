import { Button, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { action } from "storybook/actions";
import { ConfirmationModal } from "./ConfirmationModal";

const meta = {
    title: "Components/General/ConfirmationModal",
    component: ConfirmationModal,
} satisfies Meta<typeof ConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

type Props = Parameters<typeof ConfirmationModal>[0];

const Wrapper = (props: Props) => {
    const [opened, handlers] = useDisclosure(false);
    const [resultTxt, setResultTxt] = useState<string | null>(null);

    return (
        <Stack
            align="center"
            justify="center"
            gap="md"
            style={{ height: "100vh", width: "100vw" }}
        >
            <ConfirmationModal
                {...props}
                isOpened={opened}
                onClose={() => {
                    setResultTxt("Not confirmed");
                    handlers.close();
                }}
                onConfirm={() => {
                    setResultTxt("Confirmed");
                    handlers.close();
                }}
            />
            <Button onClick={handlers.open}>Open Confirmation Modal</Button>
            <Group>
                <Text>Result: {resultTxt ?? "No interaction yet"}</Text>
            </Group>
        </Stack>
    );
};

/**
 * The standard story for the ConfirmationModal component.
 */
export const Default: Story = {
    args: {
        isOpened: false,
        title: "Confirmation before proceeding",
        text: "Are you sure you want to proceed?",
        onClose: action("Modal Closed"),
        onConfirm: action("Confirmed"),
    },
    render: Wrapper,
};
