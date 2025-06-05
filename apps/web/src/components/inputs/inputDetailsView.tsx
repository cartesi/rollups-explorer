"use client";
import { ContentType, InputDetails } from "@cartesi/rollups-explorer-ui";
import { Alert, Box, Group, Select, Stack, Text } from "@mantine/core";
import { find, omit, pathOr } from "ramda";
import { included, isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { FC, useEffect, useMemo, useState } from "react";
import { TbExclamationCircle } from "react-icons/tb";
import { UseQueryResponse, useQuery } from "urql";
import { Address, Hex } from "viem";
import { InputItemFragment } from "../../graphql/explorer/operations";
import { RollupVersion } from "../../graphql/explorer/types";
import {
    InputDetailsDocument,
    InputDetailsQuery,
    InputDetailsQueryVariables,
} from "../../graphql/rollups/operations";
import { Voucher } from "../../graphql/rollups/types";
import {
    InputDetailsDocument as V2InputDetailsDocument,
    InputDetailsQuery as V2InputDetailsQuery,
    InputDetailsQueryVariables as V2InputDetailsQueryVariables,
} from "../../graphql/rollups/v2/operations";
import { Voucher as VoucherV2 } from "../../graphql/rollups/v2/types";
import getConfiguredChainId from "../../lib/getConfiguredChain";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import { theme } from "../../providers/theme";
import { useBlockExplorerData } from "../BlockExplorerLink";
import AddressEl from "../address";
import { NewSpecificationButton } from "../specification/components/NewSpecificationButton";
import { findSpecificationFor } from "../specification/conditionals";
import { Envelope, decodePayload } from "../specification/decoder";
import { useSpecification } from "../specification/hooks/useSpecification";
import { useSystemSpecifications } from "../specification/hooks/useSystemSpecifications";
import useVoucherDecoder from "../specification/hooks/useVoucherDecoder";
import { Specification } from "../specification/types";
import { stringifyContent } from "../specification/utils";
import VoucherExecution from "./voucherExecution";
import VoucherExecutionV2 from "./voucherExecutionV2";

interface ApplicationInputDataProps {
    input: InputItemFragment;
}

type OptionalInputDetailsVariables = Omit<
    InputDetailsQueryVariables & V2InputDetailsQueryVariables,
    "inputIdx" | "inputId"
>;

type InputTypes = "vouchers" | "reports" | "notices";

const destinationOrString = pathOr("", ["edges", "0", "node", "destination"]);
const payloadOrString = pathOr("", ["edges", 0, "node", "payload"]);

const updateForNextPage = (
    name: InputTypes,
    obj: OptionalInputDetailsVariables,
) => {
    switch (name) {
        case "vouchers":
            return omit(["lastVouchers", "vouchersPrevPage"], obj);
        case "notices":
            return omit(["lastNotices", "noticesPrevPage"], obj);
        case "reports":
            return omit(["lastReports", "reportsPrevPage"], obj);
        default:
            throw new Error(`${name} not supported.`);
    }
};

const updateForPrevPage = (
    name: InputTypes,
    obj: OptionalInputDetailsVariables,
) => {
    switch (name) {
        case "vouchers":
            return omit(["firstVouchers", "vouchersNextPage"], obj);
        case "notices":
            return omit(["firstNotices", "noticesNextPage"], obj);
        case "reports":
            return omit(["firstReports", "reportsNextPage"], obj);
        default:
            throw new Error(`${name} not supported.`);
    }
};

const getStringifiedDecodedValueOrPayload = (
    envelope: Envelope | undefined,
    originalPayload: string,
) => {
    if (envelope?.error) {
        console.error(envelope.error);
        return originalPayload;
    }

    if (!envelope || isNilOrEmpty(envelope?.result)) {
        return originalPayload;
    }

    return stringifyContent(envelope.result);
};

type UseDecodingOnInputResult = [
    string,
    {
        specApplied: Specification | null;
        userSpecifications: Specification[];
        systemSpecifications: Specification[];
        error?: Error;
        wasSpecManuallySelected: boolean;
    },
];

/**
 * Receive the input from a graphQL call and
 * It may find a specification that matches a defined condition, therefore decoding the content.
 * If an specification is not found it returns the original payload.
 * @param input Input data returned by graphQL.
 * @param specName Specification id to apply instead of check for matching conditions. (optional)
 * @returns { UseDecodingOnInputResult }
 */
const useDecodingOnInput = (
    input: InputItemFragment,
    specId?: string,
): UseDecodingOnInputResult => {
    const { listSpecifications } = useSpecification();
    const { systemSpecificationAsList } = useSystemSpecifications();

    const userSpecifications = listSpecifications() ?? [];
    const specifications = [
        ...systemSpecificationAsList,
        ...userSpecifications,
    ];

    const specification = isNilOrEmpty(specId)
        ? findSpecificationFor(input, specifications)
        : (find((spec) => spec.id === specId, specifications) ?? null);

    const envelope = specification
        ? decodePayload(specification, input.payload as Hex)
        : undefined;

    const result = getStringifiedDecodedValueOrPayload(envelope, input.payload);

    return [
        result,
        {
            specApplied: specification,
            systemSpecifications: systemSpecificationAsList,
            userSpecifications,
            error: envelope?.error,
            wasSpecManuallySelected: isNotNilOrEmpty(specId),
        },
    ];
};

const buildSelectData = (
    userSpecifications: Specification[],
    systemSpecifications: Specification[],
) => {
    const groups = [];

    if (userSpecifications.length) {
        groups.push({
            group: "Your Specifications",
            items: userSpecifications.map((spec) => ({
                label: spec.name,
                value: spec.id!,
            })),
        });
    }

    if (systemSpecifications.length) {
        groups.push({
            group: "System Specifications",
            items: systemSpecifications.map((spec) => ({
                label: spec.name,
                value: spec.id!,
            })),
        });
    }

    return groups;
};

const chainId = Number.parseInt(getConfiguredChainId());

const getInputDetailsQueryFactoryByVersion = {
    [RollupVersion.V1]:
        (inputIdx: string) => (optionals: OptionalInputDetailsVariables) => {
            return useQuery<InputDetailsQuery, InputDetailsQueryVariables>({
                query: InputDetailsDocument,
                pause: true,
                variables: {
                    inputIdx: parseInt(inputIdx),
                    ...optionals,
                },
            });
        },
    [RollupVersion.V2]:
        (inputId: string) => (optionals: OptionalInputDetailsVariables) => {
            return useQuery<V2InputDetailsQuery, V2InputDetailsQueryVariables>({
                query: V2InputDetailsDocument,
                pause: true,
                variables: {
                    inputId,
                    ...optionals,
                },
            });
        },
} as const;

/**
 * InputDetailsView should be lazy rendered.
 * to avoid multiple eager network calls.
 */
const InputDetailsView: FC<ApplicationInputDataProps> = ({ input }) => {
    const { getConnection, hasConnection, showConnectionModal } =
        useConnectionConfig();
    const appId = input.application.address as Address;
    const appVersion = input.application.rollupVersion;
    const requiredValue = input.index.toString();

    const inputDetailsQuery = useMemo(() => {
        const factory = getInputDetailsQueryFactoryByVersion[appVersion];

        if (!factory) {
            const text = isNilOrEmpty(appVersion)
                ? `Missing appVersion (${appVersion})`
                : `appVersion: ${appVersion} not supported.`;
            console.warn(`${text}. GraphQL queries will be skipped.`);

            return () => [{}, () => {}] as UseQueryResponse;
        }

        return factory(requiredValue);
    }, [appVersion, requiredValue]);

    const connection = getConnection(appId);
    const [selectedSpec, setSelectedSpec] = useState<string>("");
    const [variables, updateQueryVars] =
        useState<OptionalInputDetailsVariables>({
            firstNotices: 1,
            firstReports: 1,
            firstVouchers: 1,
        });

    const [result, execQuery] = inputDetailsQuery(variables);

    const reports = result.data?.input.reports;
    const notices = result.data?.input.notices;
    const vouchers = result.data?.input.vouchers;

    const showNotices =
        !connection ||
        (connection && notices && payloadOrString(notices) !== "");
    const showReports =
        !connection ||
        (connection && reports && payloadOrString(reports) !== "");
    const showVouchers =
        !connection ||
        (connection && vouchers && payloadOrString(vouchers) !== "");
    const vouchersForExecution = (vouchers?.edges?.map((e: any) => e.node) ??
        []) as Partial<Voucher>[] | VoucherV2[];
    const showVoucherForExecution =
        showVouchers && vouchersForExecution.length > 0;

    const [
        content,
        {
            specApplied,
            error,
            systemSpecifications,
            userSpecifications,
            wasSpecManuallySelected,
        },
    ] = useDecodingOnInput(input, selectedSpec);

    const voucherDestination = destinationOrString(vouchers) as Hex;
    const voucherBlockExplorer = useBlockExplorerData(
        "address",
        voucherDestination,
    );

    const voucherDecoderRes = useVoucherDecoder({
        payload: payloadOrString(vouchers) as Hex,
        destination: voucherDestination,
        chainId,
        appVersion,
    });

    const selectData = buildSelectData(
        userSpecifications,
        systemSpecifications,
    );

    useEffect(() => {
        if (connection) execQuery({ url: connection.url });
    }, [connection, execQuery, variables]);

    const isSystemSpecAppliedManually =
        wasSpecManuallySelected && included(systemSpecifications, specApplied);

    const [voucherContentType, setVoucherContentType] =
        useState<ContentType>("raw");
    const [inputContentType, setInputContentType] =
        useState<ContentType>("raw");

    const voucherContent =
        voucherContentType === "raw" || voucherDecoderRes.data === null
            ? payloadOrString(vouchers)
            : voucherDecoderRes.data;

    const inputContent =
        inputContentType === "raw" || error ? input.payload : content;

    return (
        <Box py="md">
            <InputDetails>
                <InputDetails.InputContent
                    content={inputContent}
                    contentType={inputContentType}
                    onContentTypeChange={setInputContentType}
                    additionalControls={!error ? ["decoded"] : []}
                >
                    <Stack gap="sm">
                        <Group>
                            <Select
                                label="Decode Specification"
                                description="When a specification condition(s) match(es), it will be auto-selected."
                                placeholder="Decode content with..."
                                value={specApplied?.id ?? selectedSpec}
                                size="md"
                                checkIconPosition="right"
                                data={selectData}
                                onChange={(value) => {
                                    setSelectedSpec(value ?? "");
                                }}
                                error={
                                    error
                                        ? `We're not able to decode using ${specApplied?.name}`
                                        : null
                                }
                            />
                        </Group>
                        {isSystemSpecAppliedManually && (
                            <Group>
                                <Alert
                                    data-testid="system-spec-applied-warning"
                                    icon={
                                        <TbExclamationCircle
                                            size={theme.other.iconSize}
                                        />
                                    }
                                    color="orange"
                                    title="System Specifications"
                                >
                                    Be careful when manually selecting system
                                    specifications.
                                    <br /> It may show readable information by
                                    sheer luck of byte length.
                                    <br /> They are always auto-selected.
                                </Alert>
                            </Group>
                        )}

                        {!specApplied && (
                            <Group gap={3}>
                                <Text c="dimmed">
                                    {`Is this Application ABI encoding it's inputs?`}
                                </Text>
                                <NewSpecificationButton
                                    p={0}
                                    variant="transparent"
                                    btnText="Add a Spec!"
                                />
                            </Group>
                        )}
                    </Stack>
                </InputDetails.InputContent>

                {showReports && (
                    <InputDetails.ReportContent
                        content={payloadOrString(reports)}
                        contentType="raw"
                        onConnect={() => showConnectionModal(appId)}
                        isLoading={result.fetching}
                        isConnected={hasConnection(appId)}
                        paging={{
                            total: reports?.totalCount ?? 0,
                            onNextPage: () => {
                                updateQueryVars((vars) => {
                                    const newVars = {
                                        ...vars,
                                        firstReports: 1,
                                        reportsNextPage:
                                            reports?.pageInfo.endCursor,
                                    };

                                    return updateForNextPage(
                                        "reports",
                                        newVars,
                                    );
                                });
                            },
                            onPreviousPage: () => {
                                updateQueryVars((vars) => {
                                    const newVars = {
                                        ...vars,
                                        lastReports: 1,
                                        reportsPrevPage:
                                            reports?.pageInfo.startCursor,
                                    };
                                    return updateForPrevPage(
                                        "reports",
                                        newVars,
                                    );
                                });
                            },
                        }}
                    />
                )}

                {showNotices && (
                    <InputDetails.NoticeContent
                        content={payloadOrString(notices)}
                        contentType="raw"
                        onConnect={() => showConnectionModal(appId)}
                        isLoading={result.fetching}
                        isConnected={hasConnection(appId)}
                        paging={{
                            total: notices?.totalCount ?? 0,
                            onNextPage: () => {
                                updateQueryVars((vars) => {
                                    const newVars = {
                                        ...vars,
                                        firstNotices: 1,
                                        noticesNextPage:
                                            notices?.pageInfo.endCursor,
                                    };
                                    return updateForNextPage(
                                        "notices",
                                        newVars,
                                    );
                                });
                            },
                            onPreviousPage: () => {
                                updateQueryVars((vars) => {
                                    const newVars = {
                                        ...vars,
                                        lastNotices: 1,
                                        noticesPrevPage:
                                            notices?.pageInfo.startCursor,
                                    };

                                    return updateForPrevPage(
                                        "notices",
                                        newVars,
                                    );
                                });
                            },
                        }}
                    />
                )}

                {showVouchers && (
                    <InputDetails.VoucherContent
                        content={voucherContent}
                        contentType={voucherContentType}
                        additionalControls={
                            voucherDecoderRes.data ? ["decoded"] : []
                        }
                        onContentTypeChange={setVoucherContentType}
                        onConnect={() => showConnectionModal(appId)}
                        isLoading={result.fetching}
                        isConnected={hasConnection(appId)}
                        paging={{
                            total: vouchers?.totalCount ?? 0,
                            onNextPage: () => {
                                updateQueryVars((vars) => {
                                    const newVars = {
                                        ...vars,
                                        firstVouchers: 1,
                                        vouchersNextPage:
                                            vouchers?.pageInfo.endCursor,
                                    };

                                    return updateForNextPage(
                                        "vouchers",
                                        newVars,
                                    );
                                });
                            },
                            onPreviousPage: () => {
                                updateQueryVars((vars) => {
                                    const newVars = {
                                        ...vars,
                                        lastVouchers: 1,
                                        vouchersPrevPage:
                                            vouchers?.pageInfo.startCursor,
                                    };

                                    return updateForPrevPage(
                                        "vouchers",
                                        newVars,
                                    );
                                });
                            },
                        }}
                        middlePosition={
                            isNotNilOrEmpty(voucherDestination) && (
                                <Group
                                    gap="xs"
                                    data-testid="voucher-destination-block-explorer-link"
                                >
                                    <Text fw="bold">Destination Address:</Text>
                                    <AddressEl
                                        value={voucherDestination}
                                        href={voucherBlockExplorer.url}
                                        hrefTarget="_blank"
                                        shorten
                                    />
                                </Group>
                            )
                        }
                    >
                        {showVoucherForExecution ? (
                            appVersion === RollupVersion.V1 ? (
                                <VoucherExecution
                                    appId={appId}
                                    voucher={
                                        vouchersForExecution[0] as Partial<Voucher>
                                    }
                                />
                            ) : appVersion === RollupVersion.V2 ? (
                                <VoucherExecutionV2
                                    input={input}
                                    voucher={
                                        vouchersForExecution[0] as VoucherV2
                                    }
                                />
                            ) : null
                        ) : null}
                    </InputDetails.VoucherContent>
                )}
            </InputDetails>
        </Box>
    );
};

export default InputDetailsView;
