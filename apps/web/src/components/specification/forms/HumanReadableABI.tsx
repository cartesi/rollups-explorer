import { Accordion, JsonInput, Stack, Textarea, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { isNotNil } from "ramda";
import { isBlank, isFunction } from "ramda-adjunct";
import { FC, useEffect } from "react";
import { Abi, parseAbi } from "viem";

const placeholder = `function balanceOf(address owner) view returns (uint256) \nevent Transfer(address indexed from, address indexed to, uint256 amount)`;
interface Props {
    abi?: Abi;
    onAbiChange: (abi: Abi) => void;
}

const Separator = "\n" as const;

const stringifyContent = (value: any) => JSON.stringify(value, null, 2);

export const HumanReadableABI: FC<Props> = ({ onAbiChange }) => {
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            humanABIEntry: "",
        },
        validate: {
            humanABIEntry: (value) => {
                if (isBlank(value))
                    return "The ABI signature definition is required!";
                const items = value.split(Separator);

                try {
                    parseAbi(items);
                } catch (error: any) {
                    return error.message;
                }
                return null;
            },
        },
        transformValues: (values) => {
            if (isBlank(values.humanABIEntry))
                return { generatedAbi: null, readableList: null };
            const readableList = values.humanABIEntry.split(Separator);
            let generatedAbi;
            try {
                generatedAbi = parseAbi(readableList);
            } catch (error: any) {
                generatedAbi = null;
            }
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
                label="ABI"
                description="Define abi signatures in Human readable format"
                placeholder={placeholder}
                rows={5}
                {...form.getInputProps("humanABIEntry")}
            />

            {displayAccordion && (
                <Accordion variant="contained" chevronPosition="right" py="sm">
                    {readableList && (
                        <Accordion.Item
                            key="abi-signatures-item"
                            value="abi-signatures-item"
                        >
                            <Accordion.Control>
                                <Title order={4}>ABI Signatures</Title>
                            </Accordion.Control>

                            <Accordion.Panel>
                                {/* <Code> */}
                                <JsonInput
                                    value={stringifyContent(readableList)}
                                    readOnly
                                    variant="transparent"
                                    autosize
                                />
                                {/* </Code> */}
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}

                    {generatedAbi && (
                        <Accordion.Item
                            key="abi-generated-json-item"
                            value="abi-generated-json-item"
                        >
                            <Accordion.Control>
                                <Title order={4}>JSON ABI Generated</Title>
                            </Accordion.Control>

                            <Accordion.Panel>
                                {/* <Code> */}
                                <JsonInput
                                    variant="transparent"
                                    readOnly
                                    autosize
                                    value={stringifyContent(generatedAbi)}
                                />
                                {/* </Code> */}
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}
                </Accordion>
            )}
        </Stack>
    );
};
