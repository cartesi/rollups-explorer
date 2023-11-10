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
import { UseQueryExecute, UseQueryState, useQuery } from "urql";
import { Address, isAddress } from "viem";
import {
    ApplicationsDocument,
    ApplicationsQuery,
    ApplicationsQueryVariables,
} from "../graphql";
import {
    CheckStatusDocument,
    CheckStatusQuery,
    CheckStatusQueryVariables,
} from "../graphql/rollups/operations";
import { useConnectionConfig } from "../providers/connectionConfig/hooks";

interface AppConnectionFormProps {
    application?: Address;
    onSubmitted?: () => void;
}

type UseSearchApplications = (params: {
    address: Address;
    limit?: number;
}) => [{ applications: string[]; fetching: boolean }, UseQueryExecute];

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

const useSearchApplications: UseSearchApplications = ({
    address,
    limit,
}): [{ applications: string[]; fetching: boolean }, UseQueryExecute] => {
    const [result, executeQuery] = useQuery<
        ApplicationsQuery,
        ApplicationsQueryVariables
    >({
        query: ApplicationsDocument,
        variables: {
            limit: limit ?? 10,
            where: {
                id_containsInsensitive: address ?? "",
            },
        },
    });
    const data = result.data;
    const applications = React.useMemo(
        () => (data?.applications ?? []).map((a) => a.id),
        [data],
    );

    return [{ applications, fetching: result.fetching }, executeQuery];
};

const AppConnectionForm: FC<AppConnectionFormProps> = ({
    application,
    onSubmitted,
}) => {
    const { addConnection, hasConnection } = useConnectionConfig();
    const theme = useMantineTheme();
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
                    return `There is an connection for that address`;
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

    const [{ applications, fetching }] = useSearchApplications({
        address: debouncedAddress,
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
    const testSuccess = !result.fetching && !result.stale && !result.error;

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
                <Button type="submit" loading={submitting}>
                    Save
                </Button>
            </Flex>
        </form>
    );
};

export default AppConnectionForm;
