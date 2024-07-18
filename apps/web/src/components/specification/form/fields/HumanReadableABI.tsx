import { CodeHighlight } from "@mantine/code-highlight";
import { Accordion, Stack, Textarea, Title } from "@mantine/core";
import { createFormActions, useForm } from "@mantine/form";
import { isNotNil } from "ramda";
import { isBlank, isFunction } from "ramda-adjunct";
import { FC, ReactNode, useEffect } from "react";
import { Abi, parseAbi } from "viem";
import LabelWithTooltip from "../../../labelWithTooltip";
import { prepareSignatures, stringifyContent } from "../../utils";

const placeholder = `function balanceOf(address owner) view returns (uint256) \nevent Transfer(address indexed from, address indexed to, uint256 amount)`;
interface Props {
    abi?: Abi;
    onAbiChange: (abi: Abi) => void;
    error?: string | ReactNode;
}

const abiTipMessage =
    "Define the signature without wrapping it on quotes nor adding comma at the end to separate. Just hit enter and keep defining your signatures";

interface FormValues {
    humanABIEntry: string;
}

interface FormTransformedValues {
    generatedAbi?: Abi;
    readableList?: string[];
}

type FormTransform = (v: FormValues) => FormTransformedValues;

export const humanReadableABIFormActions = createFormActions<FormValues>(
    "human-readable-abi-form",
);

export const HumanReadableABI: FC<Props> = ({ onAbiChange, error }) => {
    const form = useForm<FormValues, FormTransform>({
        name: "human-readable-abi-form",
        validateInputOnChange: true,
        initialValues: {
            humanABIEntry: "",
        },
        validate: {
            humanABIEntry: (value) => {
                if (isBlank(value))
                    return "The ABI signature definition is required!";
                const items = prepareSignatures(value);

                try {
                    parseAbi(items);
                } catch (error: any) {
                    return error.message;
                }
                return null;
            },
        },
        transformValues: (values) => {
            if (isBlank(values.humanABIEntry)) return {};

            const readableList = prepareSignatures(values.humanABIEntry);
            let generatedAbi;
            try {
                generatedAbi = parseAbi(readableList);
            } catch (error: any) {}

            return {
                generatedAbi,
                readableList,
            };
        },
    });

    const { generatedAbi, readableList } = form.getTransformedValues();
    const key = JSON.stringify(readableList);
    const displayAccordion = isNotNil(generatedAbi) || isNotNil(readableList);

    useEffect(() => {
        if (isFunction(onAbiChange)) onAbiChange(generatedAbi ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onAbiChange, key]);

    return (
        <Stack>
            <Textarea
                data-testid="human-readable-abi-input"
                resize="vertical"
                label={
                    <LabelWithTooltip
                        label="ABI"
                        tooltipLabel={abiTipMessage}
                    />
                }
                description="Define signatures in Human readable format"
                placeholder={placeholder}
                rows={5}
                {...form.getInputProps("humanABIEntry")}
                error={error || form.errors.humanABIEntry}
            />

            {displayAccordion && (
                <Accordion variant="contained" chevronPosition="right" py="sm">
                    <Accordion.Item
                        key="abi-signatures-item"
                        value="abi-signatures-item"
                    >
                        <Accordion.Control>
                            <Title order={4}>ABI Signatures</Title>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <CodeHighlight
                                withCopyButton={false}
                                language="solidity"
                                code={stringifyContent(readableList ?? [])}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item
                        key="abi-generated-json-item"
                        value="abi-generated-json-item"
                    >
                        <Accordion.Control>
                            <Title order={4}>JSON ABI Generated</Title>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <CodeHighlight
                                withCopyButton={false}
                                language="JSON"
                                code={stringifyContent(generatedAbi ?? [])}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            )}
        </Stack>
    );
};
