"use client";
import {
    Badge,
    Button,
    Card,
    Divider,
    Flex,
    Group,
    Loader,
    Stack,
    Switch,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import { useForm, type FormErrors } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { isEmpty, isNil, isNotNil, path, toPairs } from "ramda";
import React, { useEffect, useRef, useState, type FC } from "react";
import {
    TbCircleCheckFilled,
    TbCircleXFilled,
    TbPlugConnected,
    TbPlugConnectedX,
} from "react-icons/tb";
import { createPublicClient, http, type Chain } from "viem";
import useRightColorShade from "../../hooks/useRightColorShade";
import { checkChainId } from "../../lib/supportedChains";
import { checkNodeVersion } from "../../lib/supportedRollupsNode";
import { checkURL } from "../../lib/urlUtils";
import { useGetNodeInformation, useNodeConnection } from "./hooks";
import type { NodeConnectionConfig } from "./types";

interface ConnectionFormProps {
    onConnectionSaved?: () => void;
}

type ChainRpcHealthCheck =
    | {
          status: "success";
          blocknumber: bigint;
      }
    | {
          status: "error";
          error: Error;
      }
    | {
          status: "idle";
      }
    | {
          status: "pending";
      };

const useChainRpcHealthCheck = (
    url: string,
    chain: Chain | null,
): ChainRpcHealthCheck => {
    const [result, setResult] = useState<ChainRpcHealthCheck>({
        status: "idle",
    });

    useEffect(() => {
        const urlCheck = checkURL(url);
        if (!urlCheck.validUrl || isNil(chain)) return;

        setResult({ status: "pending" });
        const abortController = new AbortController();
        const publicClient = createPublicClient({
            chain,
            transport: http(url, {}),
        });

        publicClient
            .getBlockNumber()
            .then((blocknumber) => {
                if (abortController.signal.aborted) {
                    console.info(
                        `skipping blocknumber return: ${abortController.signal.reason}`,
                    );
                    return;
                }
                setResult({
                    status: "success",
                    blocknumber,
                });
            })
            .catch((reason) => {
                if (abortController.signal.aborted) {
                    console.info(
                        `Skipping promise catch handling: ${abortController.signal.reason}`,
                    );
                }
                setResult({
                    status: "error",
                    error: reason,
                });
            });

        return () => {
            abortController.abort("Url or Chain changed.");
            setResult({ status: "idle" });
        };
    }, [url, chain]);

    return result;
};

const handleSubmitFormErrors = (errors: FormErrors) => {
    toPairs(errors).forEach(([key, value]) => {
        notifications.show({
            id: key,
            message: value,
            color: "red",
        });
    });
};

const ConnectionForm: FC<ConnectionFormProps> = ({ onConnectionSaved }) => {
    const { addConnection } = useNodeConnection();
    const theme = useMantineTheme();
    const btnRef = useRef<HTMLButtonElement>(null);
    const successColor = useRightColorShade("green");
    const errorColor = useRightColorShade("red");
    const idleColor = useRightColorShade("gray");
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            name: "",
            url: "",
            isPreferred: false,
            chainRpcUrl: "",
        },
        validate: {
            name: (v) => {
                if (isEmpty(v)) return `Name is a required field!`;

                return null;
            },
            url: (v) => {
                if (isEmpty(v)) return "URL is a required field!";
            },
            chainRpcUrl: (v) => {
                if (isEmpty(v)) return "Chain json-rpc endpoint can't be blank";
            },
        },
    });
    const [submitting, setSubmitting] = useState(false);
    const { url, chainRpcUrl } = form.getTransformedValues();
    const [debouncedUrl] = useDebouncedValue(url, 500);
    const [debouncedChainUrl] = useDebouncedValue(chainRpcUrl, 500);

    const { validUrl } = React.useMemo(
        () => checkURL(debouncedUrl),
        [debouncedUrl],
    );

    const [nodeInfoResult] = useGetNodeInformation(
        validUrl ? debouncedUrl : null,
    );

    const { chainId, nodeVersion } =
        nodeInfoResult.status === "success" ? nodeInfoResult.data : {};

    const chainCheckRes = isNotNil(chainId) ? checkChainId(chainId) : null;
    const versionCheckRes = isNotNil(nodeVersion)
        ? checkNodeVersion(nodeVersion)
        : null;

    const nodeChain =
        chainCheckRes?.status === "supported" ? chainCheckRes.chain : null;

    const chainRpcHealthCheck = useChainRpcHealthCheck(
        debouncedChainUrl,
        nodeChain,
    );

    const testSuccess = validUrl && nodeInfoResult.status === "success";
    const nodeInfoError =
        nodeInfoResult.status === "error" ? nodeInfoResult.error : null;

    const canSave =
        nodeInfoResult.status === "success" &&
        versionCheckRes?.status === "supported" &&
        chainCheckRes?.status === "supported" &&
        chainRpcHealthCheck.status === "success";

    const showNodeInformation =
        nodeInfoResult.status === "success" &&
        chainCheckRes !== null &&
        versionCheckRes !== null;

    const onSuccess = () => {
        const { name } = form.getTransformedValues();
        notifications.show({
            message: `Connection ${name} created with success`,
            color: "green",
            withBorder: true,
        });
        form.reset();
        setSubmitting(false);
        onConnectionSaved?.();
    };

    const onFailure = () => {
        notifications.show({
            message: `Failed to create connection.`,
            color: "red",
            withBorder: true,
        });
    };

    useEffect(() => {
        if (showNodeInformation) {
            btnRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [showNodeInformation]);

    useEffect(() => {
        if (nodeChain !== null) {
            form.setFieldValue(
                "chainRpcUrl",
                nodeChain.rpcUrls.default.http[0],
            );
        } else {
            form.resetField("chainRpcUrl");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeChain]);

    return (
        <form
            onSubmit={form.onSubmit((values) => {
                if (canSave) {
                    setSubmitting(true);

                    const newConfig: NodeConnectionConfig = {
                        name: values.name,
                        isPreferred: values.isPreferred,
                        url: values.url,
                        isDeletable: true,
                        timestamp: Date.now(),
                        type: "user",
                        version: nodeInfoResult.data.nodeVersion,
                        chain: {
                            id: nodeInfoResult.data.chainId,
                            rpcUrl: values.chainRpcUrl,
                        },
                    };

                    addConnection(newConfig, {
                        onSuccess,
                        onFailure,
                    });
                } else {
                    notifications.show({
                        message:
                            "To save a connection the endpoints must be working",
                        color: "orange",
                        withBorder: true,
                    });
                }
            }, handleSubmitFormErrors)}
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
                        ) : !validUrl || !url ? (
                            <TbPlugConnected
                                data-testid="icon-test-inactive"
                                size={theme.other.mdIconSize}
                                color={idleColor}
                            />
                        ) : validUrl && !testSuccess ? (
                            <TbPlugConnectedX
                                data-testid="icon-test-failed"
                                size={theme.other.mdIconSize}
                                color={errorColor}
                            />
                        ) : (
                            <TbPlugConnected
                                data-testid="icon-test-success"
                                size={theme.other.mdIconSize}
                                color={successColor}
                            />
                        )
                    }
                    {...form.getInputProps("url")}
                    error={form.errors["url"] || nodeInfoError?.message}
                />
                <Switch
                    type="checkbox"
                    label="Preferred Connection"
                    labelPosition="left"
                    {...form.getInputProps("isPreferred")}
                />
            </Stack>

            {showNodeInformation && (
                <>
                    <Divider
                        labelPosition="center"
                        label="Node Information"
                        my="lg"
                    />
                    <Stack>
                        <Stack gap="3" id="node-information">
                            <Card>
                                <Card.Section inheritPadding py="xs">
                                    <Group justify="space-between">
                                        <Text ff="monospace">Version</Text>
                                        <Text>
                                            {nodeInfoResult.data.nodeVersion}
                                        </Text>
                                        <Badge
                                            variant="outline"
                                            radius={0}
                                            color={
                                                versionCheckRes.status ===
                                                "supported"
                                                    ? "green"
                                                    : "red"
                                            }
                                            rightSection={
                                                versionCheckRes.status ===
                                                "supported" ? (
                                                    <TbCircleCheckFilled
                                                        size={
                                                            theme.other
                                                                .smIconSize
                                                        }
                                                    />
                                                ) : (
                                                    <TbCircleXFilled
                                                        size={
                                                            theme.other
                                                                .xsIconSize
                                                        }
                                                    />
                                                )
                                            }
                                        >
                                            supported
                                        </Badge>
                                    </Group>
                                </Card.Section>
                            </Card>

                            {versionCheckRes.status !== "supported" && (
                                <>
                                    <Group>
                                        <Text c="red" size="sm">
                                            {versionCheckRes.error.message}
                                        </Text>
                                    </Group>
                                    {versionCheckRes.status ===
                                        "not-supported-version" && (
                                        <Group>
                                            <Text c="red" size="sm">
                                                Supported range:{" "}
                                                {
                                                    versionCheckRes.extra
                                                        .supportedRange
                                                }
                                            </Text>
                                        </Group>
                                    )}
                                </>
                            )}
                        </Stack>
                        <Stack>
                            <Stack gap="3" id="chain-information">
                                <Card>
                                    <Card.Section inheritPadding py="xs">
                                        <Group justify="space-between">
                                            <Text ff="monospace">Chain</Text>
                                            <Text>
                                                {nodeInfoResult.data.chainId}
                                                {chainCheckRes.status ===
                                                    "supported" &&
                                                    `(${chainCheckRes.chain.name})`}
                                            </Text>
                                            <Badge
                                                variant="outline"
                                                radius={0}
                                                color={
                                                    chainCheckRes.status ===
                                                    "supported"
                                                        ? "green"
                                                        : "red"
                                                }
                                                rightSection={
                                                    chainCheckRes.status ===
                                                    "supported" ? (
                                                        <TbCircleCheckFilled
                                                            size={
                                                                theme.other
                                                                    .smIconSize
                                                            }
                                                        />
                                                    ) : (
                                                        <TbCircleXFilled
                                                            size={
                                                                theme.other
                                                                    .xsIconSize
                                                            }
                                                        />
                                                    )
                                                }
                                            >
                                                supported
                                            </Badge>
                                        </Group>
                                    </Card.Section>
                                </Card>

                                {chainCheckRes.status ===
                                    "not-supported-chain" && (
                                    <Text c="red" size="sm" fw="bold">
                                        {chainCheckRes.error.message}
                                    </Text>
                                )}
                            </Stack>

                            <Divider
                                label="Chain endpoint information"
                                labelPosition="center"
                            />

                            <TextInput
                                label="Chain RPC Url"
                                withAsterisk
                                placeholder="http://localhost:8545"
                                description="The chain json-rpc to connect and send transactions"
                                data-testid="chain-rpc-url"
                                rightSection={
                                    chainRpcHealthCheck.status === "pending" ? (
                                        <Loader
                                            data-testid="icon-test-loading"
                                            size="sm"
                                        />
                                    ) : chainRpcHealthCheck.status ===
                                      "idle" ? (
                                        <TbPlugConnected
                                            data-testid="icon-test-inactive"
                                            size={theme.other.mdIconSize}
                                            color={idleColor}
                                        />
                                    ) : chainRpcHealthCheck.status ===
                                      "error" ? (
                                        <TbPlugConnectedX
                                            data-testid="icon-test-failed"
                                            size={theme.other.mdIconSize}
                                            color={errorColor}
                                        />
                                    ) : (
                                        <TbPlugConnected
                                            data-testid="icon-test-success"
                                            size={theme.other.mdIconSize}
                                            color={successColor}
                                        />
                                    )
                                }
                                {...form.getInputProps("chainRpcUrl")}
                                error={
                                    form.errors["chainRpcUrl"] ||
                                    (chainRpcHealthCheck.status === "error" &&
                                        path(
                                            ["shortMessage"],
                                            chainRpcHealthCheck.error,
                                        ))
                                }
                            />
                        </Stack>
                    </Stack>
                </>
            )}

            <Flex direction="row" justify="flex-end" align="center" pt="xl">
                <Button
                    ref={btnRef}
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
