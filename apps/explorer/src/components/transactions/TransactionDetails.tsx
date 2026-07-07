import {
    Badge,
    Collapse,
    Fieldset,
    Stack,
    Switch,
    Text,
    VisuallyHidden,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { isValidElement, type FC, type ReactNode } from "react";
import { TbEye, TbEyeClosed } from "react-icons/tb";

type Detail = { text: ReactNode; legend: string };

type TransactionDetailsProps = {
    details: Detail[];
    /**
     * Initial value for the details visibility. This is not a controlled prop.
     * Follow mantine's convention for default values, using `default` prefix.
     */
    defaultOpened?: boolean;
};

const TransactionDetails: FC<TransactionDetailsProps> = ({
    details,
    defaultOpened,
}) => {
    const [showDetails, handlers] = useDisclosure(defaultOpened ?? false);
    return (
        <>
            <Switch
                size="md"
                label="Tx details"
                labelPosition="left"
                checked={showDetails}
                onChange={handlers.toggle}
                onLabel={
                    <>
                        <VisuallyHidden>Tx Details Visible</VisuallyHidden>
                        <TbEye size="1rem" />
                    </>
                }
                offLabel={
                    <>
                        <VisuallyHidden>Tx Details Hidden</VisuallyHidden>

                        <TbEyeClosed size="1rem" />
                    </>
                }
            />
            <Collapse in={showDetails} keepMounted>
                <Stack gap="xs" style={{ overflowWrap: "break-word" }}>
                    {details.map((detail, i) => (
                        <Fieldset
                            key={i}
                            legend={<Badge>{detail.legend}</Badge>}
                            p={{ base: "xs", sm: "md" }}
                        >
                            {isValidElement(detail.text) ? (
                                detail.text
                            ) : (
                                <Text c="dimmed">{detail.text}</Text>
                            )}
                        </Fieldset>
                    ))}
                </Stack>
            </Collapse>
        </>
    );
};

export default TransactionDetails;
