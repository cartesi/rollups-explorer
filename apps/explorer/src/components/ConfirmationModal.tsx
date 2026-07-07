import { Button, Group, Modal, Notification, Stack, Text } from "@mantine/core";
import { isValidElement, type FC, type ReactNode } from "react";
import { content } from "../content";

export interface ConfirmationModalProps {
    isOpened: boolean;
    title?: ReactNode;
    text: ReactNode;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 *  A modal component that displays a confirmation dialog with customizable text and actions.
 *  It can be used to confirm irreversible actions or any other user decisions.
 * @param props
 * @returns
 */
export const ConfirmationModal: FC<ConfirmationModalProps> = (props) => {
    const { isOpened, text, onClose, onConfirm, title } = props;
    const isElement = isValidElement(text);

    return (
        <Modal
            opened={isOpened}
            onClose={onClose}
            onClick={(evt) => {
                evt.stopPropagation();
            }}
            closeOnClickOutside
            title={title ?? <Text fw="bold">Before you proceed...</Text>}
            centered
        >
            <Stack gap="md">
                {isElement ? (
                    text
                ) : (
                    <Notification
                        withCloseButton={false}
                        color="red"
                        style={{ boxShadow: "none" }}
                    >
                        {text}
                    </Notification>
                )}

                <Group justify="flex-end">
                    <Button
                        variant="default"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            onClose();
                        }}
                    >
                        {content.global.btn.cancel}
                    </Button>
                    <Button
                        onClick={(evt) => {
                            evt.stopPropagation();
                            onConfirm();
                        }}
                    >
                        {content.global.btn.confirm}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
