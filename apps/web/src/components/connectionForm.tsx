"use client";
import {
    Alert,
    Autocomplete,
    Button,
    Flex,
    List,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { FC, useState } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import { UseQueryState, useQuery } from "urql";
import { Address, isAddress } from "viem";
import {
    CheckStatusDocument,
    CheckStatusQuery,
    CheckStatusQueryVariables,
} from "../graphql/rollups/operations";
import { useConnectionConfig } from "../providers/connectionConfig/hooks";

export interface AppConnectionFormProps {
    application?: Address;
    applications?: Address[];
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

const AppConnectionForm: FC<AppConnectionFormProps> = ({
    application,
    applications,
}) => {
    const { addConnection, hasConnection } = useConnectionConfig();

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            address: application ?? "",
            name: application ?? "",
            url: "",
        },
        validate: {
            address: (v) => {
                if (!isAddress(v)) {
                    return `It is not a valid address format.`;
                }

                if (hasConnection(v)) {
                    return `There is an connection for that address`;
                }

                return null;
            },
        },
        transformValues: (values) => ({
            name: values.name || values.address,
            address: values.address as Address,
            url: values.url,
        }),
    });

    const [submitting, setSubmitting] = useState(false);

    const { url } = form.getTransformedValues();

    const hasURL = url && url.trim().length > 0 ? true : false;

    const [result, executeQuery] = useQuery<
        CheckStatusQuery,
        CheckStatusQueryVariables
    >({
        query: CheckStatusDocument,
        pause: true,
        requestPolicy: "network-only",
    });

    const { operation } = result;
    const displayQueryResult = url === operation?.context?.url;

    const onSuccess = () => {
        const { name } = form.getTransformedValues();
        notifications.show({
            message: `Connection ${name} created with success`,
            color: "green",
            withBorder: true,
        });

        form.reset();
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
                setSubmitting(true);
                addConnection(values, {
                    onFinished,
                    onSuccess,
                    onFailure,
                });
            })}
        >
            <Flex direction="column" gap="sm">
                <TextInput
                    label="Name"
                    description="Meaningful name for display purposes."
                    placeholder="My app 1"
                    {...form.getInputProps("name")}
                />

                <Autocomplete
                    withAsterisk
                    label="Address"
                    description="The application smart contract address."
                    placeholder="0x"
                    data={applications}
                    {...form.getInputProps("address")}
                />

                <TextInput
                    label="URL"
                    withAsterisk
                    placeholder="https://app-hostname/graphql"
                    description="The rollups graphQL endpoint"
                    {...form.getInputProps("url")}
                />
                <Button
                    disabled={!hasURL}
                    onClick={() => executeQuery({ url })}
                    loading={result.fetching}
                >
                    Test Connection
                </Button>

                {displayQueryResult && <DisplayQueryResult result={result} />}
            </Flex>

            <Flex direction="row" justify="flex-end" align="center" pt={8}>
                <Button type="submit" loading={submitting}>
                    Save
                </Button>
            </Flex>
        </form>
    );
};

export default AppConnectionForm;
