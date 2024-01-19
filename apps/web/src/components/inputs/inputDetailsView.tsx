"use client";
import { InputDetails } from "@cartesi/rollups-explorer-ui";
import { Box } from "@mantine/core";
import { omit, pathOr } from "ramda";
import { FC, useEffect, useState } from "react";
import { useQuery } from "urql";
import { Address } from "viem";
import { InputItemFragment } from "../../graphql/explorer/operations";
import {
    InputDetailsDocument,
    InputDetailsQuery,
    InputDetailsQueryVariables,
} from "../../graphql/rollups/operations";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";

interface ApplicationInputDataProps {
    input: InputItemFragment;
}

type InputTypes = "vouchers" | "reports" | "notices";

const payloadOrString = pathOr("", ["edges", 0, "node", "payload"]);

const updateForNextPage = (
    name: InputTypes,
    obj: InputDetailsQueryVariables,
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
    obj: InputDetailsQueryVariables,
) => {
    switch (name) {
        case "vouchers":
            return omit(["firstVouchers", "vouchersNextPage"], obj);
        case "notices":
            return omit(["fistNotices", "noticesNextPage"], obj);
        case "reports":
            return omit(["firstReports", "reportsNextPage"], obj);
        default:
            throw new Error(`${name} not supported.`);
    }
};

/**
 * InputDetailsView should be lazy rendered.
 * to avoid multiple eager network calls.
 */
const InputDetailsView: FC<ApplicationInputDataProps> = ({ input }) => {
    const { getConnection, hasConnection, showConnectionModal } =
        useConnectionConfig();
    const appId = input.application.id as Address;
    const inputIdx = input.index;
    const connection = getConnection(appId);
    const [variables, updateQueryVars] = useState<InputDetailsQueryVariables>({
        firstNotices: 1,
        firstReports: 1,
        firstVouchers: 1,
        inputIdx,
    });

    const [result, execQuery] = useQuery<
        InputDetailsQuery,
        InputDetailsQueryVariables
    >({
        query: InputDetailsDocument,
        pause: true,
        variables,
    });

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

    useEffect(() => {
        if (connection) execQuery({ url: connection.url });
    }, [connection, execQuery, variables]);

    return (
        <Box py="md">
            <InputDetails>
                <InputDetails.InputContent
                    content={input.payload}
                    contentType="raw"
                />

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
                        content={payloadOrString(vouchers)}
                        contentType="raw"
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
                    />
                )}
            </InputDetails>
        </Box>
    );
};

export default InputDetailsView;
