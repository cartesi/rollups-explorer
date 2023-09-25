import {
    InputContent,
    InputDetails,
    NoticeContent,
    ReportContent,
    VoucherContent,
} from "@cartesi/rollups-explorer-ui";
import { Button, Group, Stack, Title } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

const meta: Meta<typeof InputDetails> = {
    component: InputDetails,
};

export default meta;
type Story = StoryObj<typeof InputDetails>;

const reportEx = "0x6f696969";
const jsonWithdraw0 =
    "0x7b0a20202020226d6574686f64223a202265726332307769746864726177616c222c0a202020202261726773223a207b0a2020202020202020226572633230223a2022307830353963373530374239373364313531323736386330366633326138313342433933443833454232222c0a202020202020202022616d6f756e74223a203130300a202020207d0a7d";
const jsonWithdraw1 =
    "0x7b0a20202020226d6574686f64223a202265726332307769746864726177616c222c0a202020202261726773223a207b0a2020202020202020226572633230223a2022307835396236373065396641394430413432373735314166323031443637363731396139373038353762222c0a202020202020202022616d6f756e74223a203130300a202020207d0a7d";
const jsonContent =
    "0x7b0a20202020226d6574686f64223a202265726332307769746864726177616c222c0a202020202261726773223a207b0a2020202020202020226572633230223a2022307835396236373065396641394430413432373735314166323031443637363731396139373038353762222c0a202020202020202022616d6f756e74223a2031303030303030303030303030303030303030300a202020207d0a7d";
const queryContent = `0x494e5345525420494e544f20636572746966696572202056414c554553202827307866434432423566316346353562353643306632323464614439394331346234454530393237346433272c3130202c273078664344324235663163463535623536433066323234646144393943313462344545303932373464332729`;

const useEmulatedData = (dataList: string[], delay = 0) => {
    const [loading, setLoading] = useState(delay === 0 ? false : true);
    const [index, setIndex] = useState(0);
    const data = loading ? "" : dataList[index];

    const updateHooks = (action: () => void) => {
        if (delay > 0) {
            setLoading(true);
            setTimeout(() => {
                action();
                setLoading(false);
            }, delay);
        } else {
            action();
        }
    };
    const nextPage = () => {
        updateHooks(() => setIndex((n) => n + 1));
    };

    const prevPage = () => {
        updateHooks(() => setIndex((n) => n - 1));
    };

    useEffect(() => {
        if (delay > 0) {
            updateHooks(() => setIndex(0));
        }
    }, []);

    return {
        total: dataList.length,
        data,
        loading,
        nextPage,
        prevPage,
    };
};

const InputDetailsWithDelay = () => {
    const reportQuery = useEmulatedData([reportEx], 1000);
    const voucherQuery = useEmulatedData(
        [jsonWithdraw0, jsonWithdraw1, jsonContent],
        1500,
    );
    const noticeQuery = useEmulatedData([queryContent], 300);

    return (
        <InputDetails>
            <InputContent content={queryContent} contentType="text" />
            <ReportContent
                content={reportQuery.data}
                isLoading={reportQuery.loading}
                contentType="raw"
                paging={{
                    onNextPage: () => reportQuery.nextPage(),
                    onPreviousPage: () => reportQuery.prevPage(),
                    total: reportQuery.total,
                }}
            />
            <VoucherContent
                content={voucherQuery.data}
                isLoading={voucherQuery.loading}
                contentType="json"
                paging={{
                    onNextPage: () => voucherQuery.nextPage(),
                    onPreviousPage: () => voucherQuery.prevPage(),
                    total: voucherQuery.total,
                }}
            />
            <NoticeContent
                content={noticeQuery.data}
                isLoading={noticeQuery.loading}
                contentType="text"
                paging={{
                    onNextPage: () => noticeQuery.nextPage(),
                    onPreviousPage: () => noticeQuery.prevPage(),
                    total: noticeQuery.total,
                }}
            />
        </InputDetails>
    );
};

const InputDetailsWithHooks = () => {
    const reportQuery = useEmulatedData([reportEx]);
    const voucherQuery = useEmulatedData([
        jsonWithdraw0,
        jsonWithdraw1,
        jsonContent,
    ]);
    const noticeQuery = useEmulatedData([queryContent]);

    return (
        <InputDetails>
            <InputContent content={queryContent} contentType="text" />
            <ReportContent
                content={reportQuery.data}
                contentType="raw"
                paging={{
                    onNextPage: () => reportQuery.nextPage(),
                    onPreviousPage: () => reportQuery.prevPage(),
                    total: reportQuery.total,
                }}
            />
            <VoucherContent
                content={voucherQuery.data}
                contentType="json"
                paging={{
                    onNextPage: () => voucherQuery.nextPage(),
                    onPreviousPage: () => voucherQuery.prevPage(),
                    total: voucherQuery.total,
                }}
            />
            <NoticeContent
                content={noticeQuery.data}
                contentType="text"
                paging={{
                    onNextPage: () => noticeQuery.nextPage(),
                    onPreviousPage: () => noticeQuery.prevPage(),
                    total: noticeQuery.total,
                }}
            />
        </InputDetails>
    );
};

const InputDetailsNoContent = () => {
    const voucherQuery = useEmulatedData([], 1000);

    return (
        <InputDetails>
            <InputContent content={queryContent} contentType="text" />
            <VoucherContent
                content={voucherQuery.data}
                isLoading={voucherQuery.loading}
                contentType="raw"
                paging={{
                    onNextPage: () => voucherQuery.nextPage(),
                    onPreviousPage: () => voucherQuery.prevPage(),
                    total: voucherQuery.total,
                }}
            />
        </InputDetails>
    );
};

const WithDynamicContent = () => {
    const reportQuery = useEmulatedData([reportEx]);
    const voucherQuery = useEmulatedData([
        jsonWithdraw0,
        jsonWithdraw1,
        jsonContent,
    ]);
    const noticeQuery = useEmulatedData([queryContent]);

    const [showNotice, setShowNotice] = useState(false);
    const [showReport, setShowReport] = useState(true);
    const [showVourcher, setShowVourcher] = useState(false);

    return (
        <Stack>
            <Title order={1}>
                Toggle the content and watch the tabs change
            </Title>
            <Group gap={3}>
                <Button onClick={() => setShowVourcher((v) => !v)}>
                    Toggle Voucher
                </Button>
                <Button onClick={() => setShowReport((v) => !v)}>
                    Toggle Report
                </Button>
                <Button onClick={() => setShowNotice((v) => !v)}>
                    Toggle Notice
                </Button>
            </Group>
            <InputDetails>
                <InputContent content={queryContent} contentType="text" />

                {showReport && (
                    <ReportContent
                        content={reportQuery.data}
                        contentType="raw"
                        paging={{
                            onNextPage: () => reportQuery.nextPage(),
                            onPreviousPage: () => reportQuery.prevPage(),
                            total: reportQuery.total,
                        }}
                    />
                )}

                {showVourcher && (
                    <VoucherContent
                        content={voucherQuery.data}
                        contentType="json"
                        paging={{
                            onNextPage: () => voucherQuery.nextPage(),
                            onPreviousPage: () => voucherQuery.prevPage(),
                            total: voucherQuery.total,
                        }}
                    />
                )}

                {showNotice && (
                    <NoticeContent
                        content={noticeQuery.data}
                        contentType="text"
                        paging={{
                            onNextPage: () => noticeQuery.nextPage(),
                            onPreviousPage: () => noticeQuery.prevPage(),
                            total: noticeQuery.total,
                        }}
                    />
                )}
            </InputDetails>
        </Stack>
    );
};

const WithActionToConnect = () => {
    const [delay, setDelay] = useState(0);
    const voucherQuery = useEmulatedData(
        [jsonWithdraw0, jsonWithdraw1, jsonContent],
        delay,
    );
    const [isConnected, setIsConnected] = useState(false);

    return (
        <InputDetails>
            <InputContent content={queryContent} contentType="text" />
            <VoucherContent
                isConnected={isConnected}
                onConnect={() => {
                    setDelay(600);
                    setIsConnected(() => {
                        return true;
                    });
                }}
                content={voucherQuery.data}
                isLoading={voucherQuery.loading}
                contentType="raw"
                paging={{
                    onNextPage: () => voucherQuery.nextPage(),
                    onPreviousPage: () => voucherQuery.prevPage(),
                    total: voucherQuery.total,
                }}
            />
        </InputDetails>
    );
};

export const Default: Story = {
    render: () => <InputDetailsWithHooks />,
};

export const WithDelay: Story = {
    render: () => <InputDetailsWithDelay />,
};

export const VoucherWithNoContent = {
    render: () => <InputDetailsNoContent />,
};

export const DynamicDisplayingContent = {
    render: () => <WithDynamicContent />,
};

export const WithConnectAction = {
    render: () => <WithActionToConnect />,
};
