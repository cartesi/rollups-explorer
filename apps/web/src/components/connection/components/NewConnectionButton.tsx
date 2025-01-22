import { Button, ButtonProps } from "@mantine/core";
import { FC } from "react";
import { Address } from "viem";
import { useConnectionConfig } from "../../../providers/connectionConfig/hooks";

interface NewConnectionButtonProps extends ButtonProps {
    appAddress?: Address;
}

const NewConnectionButton: FC<NewConnectionButtonProps> = (props) => {
    const { appAddress, children, ...rest } = props;
    const { showConnectionModal } = useConnectionConfig();

    return (
        <Button onClick={() => showConnectionModal(appAddress)} {...rest}>
            {children || "New Connection"}
        </Button>
    );
};

export default NewConnectionButton;
