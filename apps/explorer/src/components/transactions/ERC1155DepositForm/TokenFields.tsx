import {
    Accordion,
    Avatar,
    Button,
    Collapse,
    type DefaultMantineColor,
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
    is,
    isNil,
    isNotNil,
    or,
    pathOr,
} from "ramda";
import { type FC, useEffect } from "react";
import { type Address, toHex, zeroAddress } from "viem";
import { type Config } from "wagmi";
import {
    useReadErc1155BalanceOf,
    useReadErc1155Uri,
} from "../../../generated/wagmi";
import { type Mode, useFormContext } from "./context";
import {
    type State,
    type TokenMetadataResult,
    useGetTokenMetadata,
} from "./hooks/useGetTokenMetadata";

type BalanceOf = ReturnType<
    typeof useReadErc1155BalanceOf<
        "balanceOf",
        [Address, bigint],
        Config,
        bigint
    >
>;

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
    http_network_error: "We could not fetch the metadata.",
    not_http: "The URI is valid, but it is not an HTTP protocol.",
    errored: "Something is wrong with the URI returned by the contract.",
} as const;

const MetadataView: FC<MetadataViewProps> = ({ tokenMetadata }) => {
    const { state, url, data } = tokenMetadata;
    const message = feedbackByState[state];
    const name = pathOr("", ["name"], data);
    const description = pathOr("", ["description"], data);
    const image = pathOr("", ["image"], data);
    const dataAsString = is(Object, data)
        ? JSON.stringify(data, null, " ")
        : data;

    return (
        <>
            {isNotNil(message) && (
                <Message
                    title={message}
                    content={or(url, "URI is not defined.")}
                />
            )}

            {state === "success" && (
                <Accordion
                    chevronPosition="right"
                    variant="contained"
                    py="sm"
                    data-testid="metadata-view"
                >
                    <Accordion.Item
                        key={tokenMetadata.state}
                        value={tokenMetadata.state}
                    >
                        <Accordion.Control>
                            <Group wrap="nowrap">
                                <Avatar
                                    src={image}
                                    radius="xl"
                                    size="lg"
                                    data-testid="metadata-view-img"
                                >
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
                                value={dataAsString}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            )}
        </>
    );
};

interface AddToBatchListProps {
    name?: string;
    tokenId?: bigint;
    amount?: bigint;
}

const AddToBatchList: FC<AddToBatchListProps> = ({ name, tokenId, amount }) => {
    const form = useFormContext();
    const batchErrorMsg = pathOr(null, ["errors", "batch"], form);

    const noErrors = isNil(form.errors.amount) && isNil(form.errors.tokenId);
    const canAddToList =
        tokenId !== undefined && amount !== undefined && noErrors;

    return (
        <>
            <Button
                disabled={!canAddToList}
                onClick={() => {
                    const newEntry = {
                        amount: amount!,
                        tokenId: tokenId!,
                        name,
                        id: toHex(Date.now()),
                    };

                    form.setValues((prev) => {
                        return {
                            batch: [...(prev.batch ?? []), newEntry],
                            tokenId: "",
                            amount: "",
                        };
                    });
                }}
            >
                ADD TO DEPOSIT LIST
            </Button>

            <Text c="red" size="xs">
                {batchErrorMsg}
            </Text>
        </>
    );
};

const TokenFields: FC<Props> = ({ balanceOf, display }) => {
    const form = useFormContext();
    const mode = pathOr<Mode>("single", ["values", "mode"], form);
    const { erc1155Address, tokenId, amount } = form.getTransformedValues();
    const { data: accountBalance, isLoading: isCheckingBalance } = balanceOf;

    const { data: uri } = useReadErc1155Uri({
        address: erc1155Address !== zeroAddress ? erc1155Address : undefined,
        args: [tokenId!],
        query: {
            enabled: tokenId !== undefined,
        },
    });

    const metadataResult = useGetTokenMetadata(uri, tokenId);

    const hasMetaResult = hasResult(metadataResult.state);
    const decimals = pathOr(0, ["decimals"], metadataResult.data);
    const name = pathOr("", ["name"], metadataResult.data);
    const symbol = pathOr("", ["symbol"], metadataResult.data);

    useEffect(() => {
        form.setFieldValue("decimals", decimals);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decimals]);

    useEffect(() => {
        if (accountBalance) form.setFieldValue("balance", accountBalance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountBalance]);

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
                {mode === "batch" && (
                    <AddToBatchList
                        name={name}
                        amount={amount}
                        tokenId={tokenId}
                    />
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
