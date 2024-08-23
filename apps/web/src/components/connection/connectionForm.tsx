"use client";
import {
    Alert,
    Autocomplete,
    Button,
    Flex,
    List,
    Loader,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { isEmpty } from "ramda";
import React, { FC, useState } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbPlugConnected,
    TbPlugConnectedX,
} from "react-icons/tb";
import { UseQueryState, useQuery } from "urql";
import { Address, isAddress } from "viem";
import {
    CheckStatusDocument,
    CheckStatusQuery,
    CheckStatusQueryVariables,
} from "../../graphql/rollups/operations";
import { useSearchApplications } from "../../hooks/useSearchApplications";
import getConfiguredChainId from "../../lib/getConfiguredChain";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";

interface AppConnectionFormProps {
    application?: Address;
    onSubmitted?: () => void;
}
interface DisplayQueryResultProps {
    result: UseQueryState<CheckStatusQuery, CheckStatusQueryVariables>;
}

const DisplayQueryResult: FC<DisplayQueryResultProps> = ({ result }) => {
    return (
        <>
            {result?.data && (
                <Alert
                    title="This application responded with"
                    icon={<TbCheck />}
                    variant="light"
                    color="green"
                >
                    <List>
                        <List.Item>
                            {result.data.inputs.totalCount} Inputs
                        </List.Item>
                        <List.Item>
                            {result.data.notices.totalCount} Notices
                        </List.Item>
                        <List.Item>
                            {result.data.vouchers.totalCount} Vouchers
                        </List.Item>
                        <List.Item>
                            {result.data.reports.totalCount} Reports
                        </List.Item>
                    </List>
                </Alert>
            )}

            {result?.error && (
                <Alert
                    variant="light"
                    icon={<TbAlertCircle />}
                    title="Something went wrong"
                    color="red"
                >
                    <Text>{result.error.message}</Text>
                </Alert>
            )}
        </>
    );
};

const checkURL = (url: string) => {
    try {
        const result = new URL(url);
        return {
            validURL: true,
            result,
            url,
        };
    } catch (error: any) {
        return {
            validURL: false,
            error: error as TypeError,
            url,
        };
    }
};

const AppConnectionForm: FC<AppConnectionFormProps> = ({
    application,
    onSubmitted,
}) => {
    const { addConnection, hasConnection } = useConnectionConfig();
    const theme = useMantineTheme();
    const chainId = getConfiguredChainId();
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            address: application ?? "",
            url: "",
        },
        validate: {
            address: (v) => {
                if (isEmpty(v)) return `Address is a required field!`;

                if (!isAddress(v)) {
                    return `It is not a valid address format.`;
                }

                if (hasConnection(v)) {
                    return `There is a connection for that address`;
                }

                return null;
            },
            url: (v) => {
                if (isEmpty(v)) return "URL is a required field!";
            },
        },
        transformValues: (values) => ({
            address: values.address as Address,
            url: values.url,
        }),
    });
    const [submitting, setSubmitting] = useState(false);

    const { url, address } = form.getTransformedValues();
    const [debouncedAddress] = useDebouncedValue(address, 400);
    const [debouncedUrl] = useDebouncedValue(url, 300);

    const { applications, fetching } = useSearchApplications({
        address: debouncedAddress,
        chainId,
    });

    const showLoader = !isEmpty(debouncedAddress) && fetching;

    const { validURL } = React.useMemo(
        () => checkURL(debouncedUrl),
        [debouncedUrl],
    );

    const [result] = useQuery<CheckStatusQuery, CheckStatusQueryVariables>({
        query: CheckStatusDocument,
        pause: !validURL,
        context: React.useMemo(
            () => ({
                url: debouncedUrl,
                requestPolicy: "network-only",
            }),
            [debouncedUrl],
        ),
    });

    const { operation } = result;
    const displayQueryResult = url === operation?.context?.url;
    const testSuccess =
        !result.fetching && !result.stale && !result.error && validURL;

    const onSuccess = () => {
        const { address } = form.getTransformedValues();
        notifications.show({
            message: `Connection ${address} created with success`,
            color: "green",
            withBorder: true,
        });
        form.reset();
        onSubmitted && onSubmitted();
    };

    const onFailure = () => {
        notifications.show({
            message: `Failed to create connection.`,
            color: "red",
            withBorder: true,
        });
    };

    const onFinished = () => {
        setSubmitting((v) => !v);
    };

    return (
        <form
            onSubmit={form.onSubmit((values) => {
                if (testSuccess) {
                    setSubmitting(true);
                    addConnection(values, {
                        onFinished,
                        onSuccess,
                        onFailure,
                    });
                } else {
                    notifications.show({
                        message:
                            "To save a connection the endpoint needs to be working",
                        color: "orange",
                        withBorder: true,
                    });
                }
            })}
        >
            <Flex direction="column" gap="sm">
                <Autocomplete
                    withAsterisk
                    label="Address"
                    description="The application smart contract address."
                    rightSection={showLoader ? <Loader size="sm" /> : ""}
                    placeholder="0x"
                    data={applications}
                    data-testid="connection-address"
                    {...form.getInputProps("address")}
                />

                {isAddress(address) && !applications.length && !fetching && (
                    <Alert
                        variant="light"
                        color="yellow"
                        icon={<TbAlertCircle />}
                    >
                        <Text>
                            This is the address of an undeployed application.
                        </Text>
                    </Alert>
                )}

                <TextInput
                    label="URL"
                    withAsterisk
                    placeholder="https://app-hostname/graphql"
                    description="The rollups graphQL endpoint"
                    data-testid="connection-url"
                    rightSectionPointerEvents="none"
                    rightSection={
                        result.fetching || result.stale ? (
                            <Loader data-testid="icon-test-loading" size="sm" />
                        ) : !validURL || !url ? (
                            <TbPlugConnected
                                data-testid="icon-test-inactive"
                                size={theme.other.iconSize}
                                color={theme.colors.gray[5]}
                            />
                        ) : validURL && !testSuccess ? (
                            <TbPlugConnectedX
                                data-testid="icon-test-failed"
                                size={theme.other.iconSize}
                                color="red"
                            />
                        ) : (
                            <TbPlugConnected
                                data-testid="icon-test-success"
                                size={theme.other.iconSize}
                                color={theme.primaryColor}
                            />
                        )
                    }
                    {...form.getInputProps("url")}
                />

                {displayQueryResult && <DisplayQueryResult result={result} />}
            </Flex>

            <Flex direction="row" justify="flex-end" align="center" pt="xl">
                <Button
                    type="submit"
                    loading={submitting}
                    data-testid="connection-save"
                >
                    Save
                </Button>
            </Flex>
        </form>
    );
};

export default AppConnectionForm;
