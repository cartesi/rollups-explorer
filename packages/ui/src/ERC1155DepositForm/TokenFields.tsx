import { useErc1155BalanceOf, useErc1155Uri } from "@cartesi/rollups-wagmi";
import {
    Accordion,
    Avatar,
    Box,
    Button,
    Collapse,
    Flex,
    Group,
    JsonInput,
    Loader,
    NumberFormatter,
    NumberInput,
    Paper,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { allPass, complement, equals, hasPath, or, pathOr } from "ramda";
import { FC } from "react";
import { TbBraces } from "react-icons/tb";
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

const testJSON = {
    name: "Stoic Sellsword",
    description:
        "There are those who would laugh at bringing a sword to a gun fight. This guy doesn’t seem worried about it.",
    external_url:
        "https://rarible.com/token/0x76be3b62873462d2142405439777e971754e8e77:10789",
    token_id: 10789,
    attributes: [
        {
            key: "Rarity",
            trait_type: "Rarity",
            value: "Common",
        },
        {
            key: "Class",
            trait_type: "Class",
            value: "First Edition",
        },
        {
            key: "Parallel",
            trait_type: "Parallel",
            value: "Universal",
        },
        {
            key: "Artist",
            trait_type: "Artist",
            value: "Sasha Vinogradova",
        },
    ],
    image: "https://nftmedia.parallelnft.com/parallel-alpha/QmeHU52dkiMo7ExfPJrd6Av23pjn8zMTBktDtzXUYj1PFz/image.png",
} as const;

const MetadataView: FC<MetadataViewProps> = ({ tokenMetadata }) => {
    return (
        <Paper withBorder p="md">
            <Group wrap="nowrap">
                <Avatar
                    src="https://nftmedia.parallelnft.com/parallel-alpha/QmeHU52dkiMo7ExfPJrd6Av23pjn8zMTBktDtzXUYj1PFz/image.png"
                    radius="xl"
                    size="lg"
                />
                <div>
                    <Text>Stoic Sellsword</Text>
                    <Text size="sm" c="dimmed" fw={400}>
                        There are those who would laugh at bringing a sword to a
                        gun fight. This guy doesn’t seem worried about it.
                    </Text>
                </div>
            </Group>

            <Accordion chevronPosition="right" variant="contained" py="sm">
                <Accordion.Item
                    key={tokenMetadata.state}
                    value={tokenMetadata.state}
                >
                    <Accordion.Control>
                        <Flex direction="row" align="center" gap="xs">
                            <Box component={TbBraces} mb={1} />
                            <Text component="span" lh={0}>
                                Metadata
                            </Text>
                        </Flex>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <JsonInput
                            autosize
                            maxRows={10}
                            readOnly
                            contentEditable={false}
                            value={JSON.stringify(testJSON, null, " ")}
                        />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Paper>
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

    console.log(metadataResult);

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
                    rightSection={
                        metadataResult.state === "fetching" ? (
                            <Loader size="xs" />
                        ) : (
                            symbol || name
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
                            <Flex rowGap={6} c={"dark.2"} align="flex-start">
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
                        <Stack>
                            <MetadataView tokenMetadata={metadataResult} />
                        </Stack>
                    </>
                )}
            </Stack>
        </Collapse>
    );
};

TokenFields.displayName = "TokenFields";

export default TokenFields;
