import { useErc1155BalanceOf, useErc1155Uri } from "@cartesi/rollups-wagmi";
import {
    Accordion,
    Avatar,
    Button,
    Collapse,
    DefaultMantineColor,
    Flex,
    Group,
    JsonInput,
    Loader,
    Notification,
    NumberFormatter,
    NumberInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    allPass,
    complement,
    equals,
    hasPath,
    isNotNil,
    or,
    pathOr,
} from "ramda";
import { FC } from "react";
import { zeroAddress } from "viem";
import { useFormContext } from "./context";
import {
    State,
    TokenMetadataResult,
    useGetTokenMetadata,
} from "./useGetTokenMetadata";

type BalanceOf = ReturnType<typeof useErc1155BalanceOf<"balanceOf", bigint>>;

interface Props {
    balanceOf: BalanceOf;
    display: boolean;
}

const notIdle = complement(equals<State>("idle"));
const notFetching = complement(equals<State>("fetching"));
const hasResult = allPass([notFetching, notIdle]);

interface MetadataViewProps {
    tokenMetadata: TokenMetadataResult;
}
interface MessageProps {
    color?: DefaultMantineColor;
    title: string;
    content?: string;
}

const Message: FC<MessageProps> = ({ title, content, color }) => {
    return (
        <Notification
            color={color ?? "blue"}
            title={title}
            withCloseButton={false}
        >
            {content && <Text size="xs">{content}</Text>}
        </Notification>
    );
};

/**
 * Messages to display based on the State
 * in the token-metadata-result. Tracking only the ones of interest.
 */
const feedbackByState: Partial<Record<State, string>> = {
    http_network_error:
        "We could not fetch the data. It may be due to a CORS problem or unavailability.",
    not_http: "The URI is valid, but it is not an HTTP protocol.",
    errored: "Something is wrong with the URI returned by the contract.",
} as const;

const MetadataView: FC<MetadataViewProps> = ({ tokenMetadata }) => {
    const { state, url, data } = tokenMetadata;
    const message = feedbackByState[state];
    const name = pathOr("", ["name"], data);
    const description = pathOr("", ["description"], data);
    const image = pathOr("", ["image"], data);

    return (
        <>
            {isNotNil(message) && (
                <Message
                    title={message}
                    content={or(url, "URI is not defined.")}
                />
            )}

            {state === "success" && (
                <Accordion chevronPosition="right" variant="contained" py="sm">
                    <Accordion.Item
                        key={tokenMetadata.state}
                        value={tokenMetadata.state}
                    >
                        <Accordion.Control>
                            <Group wrap="nowrap">
                                <Avatar src={image} radius="xl" size="lg">
                                    {name ?? "TK"}
                                </Avatar>
                                <div>
                                    <Text>{name}</Text>
                                    <Text
                                        size="sm"
                                        c="dimmed"
                                        fw={400}
                                        lineClamp={2}
                                    >
                                        {description}
                                    </Text>
                                </div>
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <JsonInput
                                autosize
                                maxRows={10}
                                readOnly
                                contentEditable={false}
                                value={JSON.stringify(data, null, " ")}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            )}
        </>
    );
};

const TokenFields: FC<Props> = ({ balanceOf, display }) => {
    const form = useFormContext();
    const { erc1155Address, tokenId } = form.getTransformedValues();
    const { data: accountBalance, isLoading: isCheckingBalance } = balanceOf;

    const { data: uri, isLoading: isCheckingURI } = useErc1155Uri({
        address: erc1155Address !== zeroAddress ? erc1155Address : undefined,
        args: [tokenId!],
        enabled: tokenId !== undefined,
    });

    const metadataResult = useGetTokenMetadata(uri, tokenId);

    const hasMetaResult = hasResult(metadataResult.state);
    const decimals = pathOr(0, ["decimals"], metadataResult.data);
    const name = pathOr("", ["name"], metadataResult.data);
    const symbol = pathOr("", ["symbol"], metadataResult.data);

    return (
        <Collapse in={display}>
            <Stack>
                <TextInput
                    type="number"
                    min={0}
                    step={1}
                    label="Token id"
                    description="Token identifier to deposit"
                    placeholder="1"
                    withAsterisk
                    data-testid="token-id-input"
                    rightSection={
                        metadataResult.state === "fetching" && (
                            <Loader size="xs" />
                        )
                    }
                    {...form.getInputProps("tokenId")}
                />
                <NumberInput
                    disabled={
                        hasPath(["errors", "tokenId"], form) || !hasMetaResult
                    }
                    allowDecimal={decimals > 0}
                    decimalScale={decimals}
                    hideControls
                    min={0}
                    label="Amount"
                    description="Amount of tokens to deposit"
                    placeholder="0"
                    withAsterisk
                    data-testid="amount-input"
                    rightSectionProps={{
                        style: { width: "auto", paddingRight: "0.5rem" },
                    }}
                    rightSection={
                        metadataResult.state === "fetching" ? (
                            <Loader size="xs" />
                        ) : (
                            <Text> {symbol || name} </Text>
                        )
                    }
                    {...form.getInputProps("amount")}
                />

                {!form.errors.tokenId && (
                    <>
                        <Flex
                            mt="-sm"
                            justify={"space-between"}
                            direction={"row"}
                        >
                            <Flex rowGap={6} c={"dimmed"} align="flex-start">
                                <Text fz="xs">Balance:</Text>
                                <Text id="token-balance" fz="xs" mx={4}>
                                    {isCheckingBalance
                                        ? "Checking balance..."
                                        : ""}
                                    <NumberFormatter
                                        thousandSeparator
                                        value={or(accountBalance, 0).toString()}
                                    />
                                </Text>
                                {accountBalance !== undefined &&
                                    accountBalance > 0 && (
                                        <Button
                                            h="auto"
                                            p={2}
                                            size="xs"
                                            variant="transparent"
                                            onClick={() =>
                                                form.setFieldValue(
                                                    "amount",
                                                    accountBalance?.toString(),
                                                )
                                            }
                                            data-testid="max-amount"
                                        >
                                            Max
                                        </Button>
                                    )}
                            </Flex>

                            <Text fz="xs" c="dimmed">
                                Decimals: {decimals}
                            </Text>
                        </Flex>
                    </>
                )}
                <Stack>
                    <MetadataView tokenMetadata={metadataResult} />
                </Stack>
            </Stack>
        </Collapse>
    );
};

TokenFields.displayName = "TokenFields";

export default TokenFields;
