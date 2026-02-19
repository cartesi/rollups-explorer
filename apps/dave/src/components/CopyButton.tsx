import {
    ActionIcon,
    CopyButton as MantineCopyButton,
    rem,
    Tooltip,
} from "@mantine/core";
import { type FC } from "react";
import { TbCheck, TbCopy } from "react-icons/tb";

interface CopyButtonProps {
    value: string;
    disableTooltip?: boolean;
}

const CopyButton: FC<CopyButtonProps> = ({ value, disableTooltip = false }) => {
    return (
        <MantineCopyButton value={value} timeout={2000}>
            {({ copied, copy }) => (
                <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="right"
                    disabled={disableTooltip}
                >
                    <ActionIcon
                        color={copied ? "teal" : "gray"}
                        variant="subtle"
                        aria-label="Copy address"
                        onClick={copy}
                    >
                        {copied ? (
                            <TbCheck
                                data-testid="copied-icon"
                                style={{ width: rem(16) }}
                            />
                        ) : (
                            <TbCopy
                                data-testid="copy-icon"
                                style={{ width: rem(16) }}
                            />
                        )}
                    </ActionIcon>
                </Tooltip>
            )}
        </MantineCopyButton>
    );
};

export default CopyButton;
