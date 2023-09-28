"use client";

import { Tabs, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { head } from "ramda";
import React, {
    FC,
    Fragment,
    ReactNode,
    forwardRef,
    memo,
    useEffect,
    useMemo,
} from "react";
import InputContent from "./InputContent";
import {
    InputDetailsProvider,
    useDefinedContentSet,
    useInputDetailsDispatch,
    useInputDetailsState,
    useSupportedTabs,
} from "./InputDetailsContext";
import NoticeContent from "./NoticeContent";
import ReportContent from "./ReportContent";
import VoucherContent from "./VoucherContent";
import {
    OptionalContents,
    StaticContentComponents,
    SupportedContent,
} from "./interfaces";

interface InputDetailsProps {
    children: ReactNode | ReactNode[];
}

interface InputDetailsType
    extends FC<InputDetailsProps>,
        StaticContentComponents {}

interface MemoTabsProps {
    isSmallDevice?: boolean;
}

const MemoTabs = memo(function MemoTabs({ isSmallDevice }: MemoTabsProps) {
    const supportedTabs = useSupportedTabs();
    const definedContentSet = useDefinedContentSet();

    return (
        <>
            {supportedTabs.map((item) => {
                const hasContent = definedContentSet.has(item.type);
                // eslint-disable-next-line react/display-name
                const CText = forwardRef<HTMLParagraphElement>(
                    (_props, ref) => (
                        <Text ref={ref} size={isSmallDevice ? "xs" : "md"}>
                            {item.label}
                        </Text>
                    ),
                );
                const TabText = hasContent
                    ? CText
                    : () => (
                          <Tooltip
                              label={`No ${item.label} were created on this input.`}
                          >
                              <CText />
                          </Tooltip>
                      );

                return (
                    <Tabs.Tab
                        key={item.label}
                        value={item.label}
                        leftSection={!isSmallDevice ? <item.icon /> : null}
                        disabled={!hasContent}
                    >
                        <TabText />
                    </Tabs.Tab>
                );
            })}
        </>
    );
});

const InputDetailsTabs = memo(function InputDetailsTabs() {
    const theme = useMantineTheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.sm})`);

    return (
        <Tabs.List mr={isSmallDevice ? 0 : "sm"} mb={isSmallDevice ? "sm" : 0}>
            <MemoTabs isSmallDevice={isSmallDevice} />
        </Tabs.List>
    );
});

const InputDetailsContent: FC = () => {
    const state = useInputDetailsState();
    const { availableContent, supportedTabs } = state;
    return (
        <>
            {supportedTabs.map((tab) => {
                const childComp = availableContent[tab.type] as ReactNode;
                return !childComp ? (
                    <Fragment key={tab.label} />
                ) : (
                    <Tabs.Panel
                        key={`panel-${tab.label}`}
                        value={tab.label}
                        data-testid={`panel-${tab.label.toLowerCase()}`}
                    >
                        {childComp}
                    </Tabs.Panel>
                );
            })}
        </>
    );
};

const Details: FC<InputDetailsProps> = (props) => {
    const theme = useMantineTheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.sm})`);
    const state = useInputDetailsState();
    const selected = head(state.supportedTabs).label;
    const dict = useMemo(() => {
        return React.Children.toArray(props.children).reduce(
            (prev: OptionalContents, cur: any) => {
                const k: SupportedContent = cur.type.displayName;
                prev[k] = cur;
                return prev;
            },
            {} as OptionalContents,
        );
    }, [props.children]);

    const dispatch = useInputDetailsDispatch();

    useEffect(() => {
        dispatch({ type: "SET_DEFINED_CONTENT", payload: dict });
    }, [dict]);

    return (
        <Tabs
            defaultValue={selected}
            orientation={isSmallDevice ? "horizontal" : "vertical"}
            onChange={(val) => {
                console.log(val);
            }}
        >
            <InputDetailsTabs />
            <InputDetailsContent />
        </Tabs>
    );
};

const InputDetails: InputDetailsType = (props) => {
    return (
        <InputDetailsProvider>
            <Details>{props.children}</Details>
        </InputDetailsProvider>
    );
};

InputDetails.InputContent = InputContent;
InputDetails.VoucherContent = VoucherContent;
InputDetails.ReportContent = ReportContent;
InputDetails.NoticeContent = NoticeContent;

export {
    InputContent,
    InputDetails,
    NoticeContent,
    ReportContent,
    VoucherContent,
};
