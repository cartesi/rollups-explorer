import { Modal } from "@mantine/core";
import { isNotNil } from "ramda";
import type { FC } from "react";
import { useSendAction, useSendState } from "./hooks";

const SendModal: FC = () => {
    const state = useSendState();
    const actions = useSendAction();
    const component = state?.component ?? <></>;

    return (
        <Modal opened={isNotNil(state)} onClose={actions.closeModal}>
            {component}
        </Modal>
    );
};

export default SendModal;
