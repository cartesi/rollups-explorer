import { Button, Group, Modal, Text } from "@mantine/core";
import { FC } from "react";

export interface DeleteConnectionModalProps {
    isOpened: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteConnectionModal: FC<DeleteConnectionModalProps> = (
    props,
) => {
    const { isOpened, onClose, onConfirm } = props;

    return (
        <Modal
            opened={isOpened}
            onClose={onClose}
            title="Delete connection?"
            centered
        >
            <Text>
                This will delete the data for this connection. Are you sure you
                want to proceed?
            </Text>

            <Group mt="xl" justify="flex-end">
                <Button variant="default" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onConfirm}>Confirm</Button>
            </Group>
        </Modal>
    );
};
