import type { BondEvent, Pagination } from "@cartesi/client";
import { Group, NumberInput, Select, Stack, Text, Title } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import type { FC } from "react";
import { TbCoins } from "react-icons/tb";
import { BondAccounts } from "../components/bond/BondAccounts";
import { BondLedger } from "../components/bond/BondLedger";
import {
    bondSearchLimits,
    bondSearchUrlQueryName,
    type BondSearchLimit,
} from "../components/bond/lib/bondSearchUtils";
import CenteredText from "../components/CenteredText";
import PageTitle from "../components/layout/PageTitle";
import { content } from "../content";
import useUpdateQueryString from "../hooks/useUpdateQueryString";
import type { BondAccount, BondTotals } from "../lib/bondUtils";

const text = content.bond.page;

export interface BondsPageProps {
    application: string;
    epochIndex?: bigint;
    events: BondEvent[];
    isLoading: boolean;
    isSummaryLoading?: boolean;
    limit?: BondSearchLimit;
    pagination: Pagination;
    /**
     * Totals by account of every event in the selected epoch.
     */
    summary?: { accounts: BondAccount[]; totals: BondTotals };
}

export const BondsPage: FC<BondsPageProps> = (props) => {
    const {
        application,
        epochIndex,
        events,
        isLoading,
        isSummaryLoading,
        limit = 50,
        pagination,
        summary,
    } = props;
    const [updateUrlQueryString] = useUpdateQueryString();
    const updateEpoch = useDebouncedCallback((epoch: string) => {
        updateUrlQueryString([
            { name: bondSearchUrlQueryName.epoch, value: epoch },
            { name: bondSearchUrlQueryName.offsetValue, value: "0" },
        ]);
    }, 300);

    return (
        <Stack gap="lg">
            <PageTitle Icon={TbCoins} title={text.titleTxt} />
            <Group align="flex-end">
                <NumberInput
                    label={text.epochTxt}
                    placeholder={text.allEpochsTxt}
                    min={0}
                    allowDecimal={false}
                    allowNegative={false}
                    defaultValue={epochIndex?.toString() ?? ""}
                    onChange={(value) => updateEpoch(value.toString())}
                />
                <Select
                    allowDeselect={false}
                    label={text.limitTxt}
                    data={bondSearchLimits.map(String)}
                    value={limit.toString()}
                    w="8rem"
                    onChange={(value) =>
                        updateUrlQueryString([
                            {
                                name: bondSearchUrlQueryName.limitValue,
                                value: value ?? "",
                            },
                            {
                                name: bondSearchUrlQueryName.offsetValue,
                                value: "0",
                            },
                        ])
                    }
                />
            </Group>
            {epochIndex === undefined ? (
                <Text c="dimmed">{text.selectEpochHint}</Text>
            ) : isSummaryLoading ? (
                <CenteredText text={text.loadingTotalsTxt} />
            ) : (
                summary && (
                    <>
                        <Title order={3}>{text.accountsTxt}</Title>
                        <BondAccounts accounts={summary.accounts} />
                    </>
                )
            )}
            <Title order={3}>{text.eventsTxt}</Title>
            {isLoading ? (
                <CenteredText text={text.loadingTxt} />
            ) : (
                <BondLedger
                    application={application}
                    events={events}
                    pagination={pagination}
                    totals={summary?.totals}
                    onPaginationChange={(newOffset) =>
                        updateUrlQueryString([
                            {
                                name: bondSearchUrlQueryName.offsetValue,
                                value: newOffset.toString(),
                            },
                        ])
                    }
                />
            )}
        </Stack>
    );
};
