"use client";
import {
    Button,
    Flex,
    Loader,
    Stack,
    Switch,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { isEmpty } from "ramda";
import React, { type FC, useState } from "react";
import { TbPlugConnected, TbPlugConnectedX } from "react-icons/tb";
import { useGetNodeInformation, useNodeConnection } from "./hooks";
import type { NodeConnectionConfig } from "./types";

const checkURL = (url: string) => {
    try {
        const result = new URL(url);
        return {
            validURL: true,
            result,
            url,
        };
    } catch (error: unknown) {
        return {
            validUrl: false,
            error: error as TypeError,
            url,
        };
    }
};

const ConnectionForm: FC = () => {
    const { addConnection } = useNodeConnection();
    const theme = useMantineTheme();
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            name: "",
            url: "",
            isPreferred: false,
        },
        validate: {
            name: (v) => {
                if (isEmpty(v)) return `Name is a required field!`;

                return null;
            },
            url: (v) => {
                if (isEmpty(v)) return "URL is a required field!";
            },
        },
    });
    const [submitting, setSubmitting] = useState(false);

    const { url } = form.getTransformedValues();
    const [debouncedUrl] = useDebouncedValue(url, 300);

    const { validURL } = React.useMemo(
        () => checkURL(debouncedUrl),
        [debouncedUrl],
    );

    const nodeInfoResult = useGetNodeInformation(
        validURL ? debouncedUrl : null,
    );

    const testSuccess = validURL && nodeInfoResult.status === "success";

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
                if (testSuccess) {
                    setSubmitting(true);

                    const newConfig: NodeConnectionConfig = {
                        ...values,
                        isDeletable: true,
                        timestamp: Date.now(),
                        type: "user",
                        version: nodeInfoResult.data.nodeVersion,
                        chain: nodeInfoResult.data.chainId,
                    };

                    addConnection(newConfig, {
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
            <Stack gap="sm">
                <TextInput
                    label="Name"
                    withAsterisk
                    placeholder="your-node-conn-name..."
                    data-testid="connection-name"
                    {...form.getInputProps("name")}
                />
                <TextInput
                    label="URL"
                    withAsterisk
                    placeholder="https://host.dev/rpc"
                    description="The node rollups json-rpc endpoint"
                    data-testid="connection-url"
                    rightSectionPointerEvents="none"
                    rightSection={
                        nodeInfoResult.status === "pending" ? (
                            <Loader data-testid="icon-test-loading" size="sm" />
                        ) : !validURL || !url ? (
                            <TbPlugConnected
                                data-testid="icon-test-inactive"
                                size={theme.other.mdIconSize}
                                color={theme.colors.gray[5]}
                            />
                        ) : validURL && !testSuccess ? (
                            <TbPlugConnectedX
                                data-testid="icon-test-failed"
                                size={theme.other.mdIconSize}
                                color="red"
                            />
                        ) : (
                            <TbPlugConnected
                                data-testid="icon-test-success"
                                size={theme.other.mdIconSize}
                                color={theme.primaryColor}
                            />
                        )
                    }
                    {...form.getInputProps("url")}
                />
                <Switch
                    type="checkbox"
                    label="Preferred Connection"
                    labelPosition="left"
                    {...form.getInputProps("isPreferred")}
                />
            </Stack>

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

export default ConnectionForm;
