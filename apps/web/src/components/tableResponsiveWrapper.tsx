import {
    Box,
    Flex,
    Table,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { path } from "ramda";
import React, {
    Children,
    forwardRef,
    ForwardRefRenderFunction,
    ReactNode,
    useRef,
} from "react";
import { useElementVisibility } from "../hooks/useElementVisibility";

interface TableResponsiveWrapperProps {
    children: ReactNode;
}

interface ResponsiveTableProps {
    children: ReactNode;
    isVisible: boolean;
}

const TBodyModifier = ({ children, isVisible }: ResponsiveTableProps) => {
    return children;
};

const ResponsiveTable = forwardRef<HTMLTableCellElement, ResponsiveTableProps>(
    ({ children, isVisible }, ref) => {
        const Thead = path(["props", "children", "0"], children) as ReactNode;
        const TBody = path(["props", "children", "1"], children) as ReactNode;
        return (
            <Table width={"100%"} style={{ borderCollapse: "collapse" }}>
                <THeadModifier ref={ref} isVisible={isVisible}>
                    {Thead}
                </THeadModifier>
                <TBodyModifier isVisible={!isVisible}>{TBody}</TBodyModifier>
            </Table>
        );
    },
);

const THeadModifier = forwardRef<HTMLTableCellElement, ResponsiveTableProps>(
    ({ children, isVisible }, ref) => {
        // Extract the children of the <thead> element
        const Th = path(
            ["props", "children", "props", "children"],
            children,
        ) as ReactNode;
        const TableTh = Children.toArray(Th);
        const TableThLastTitle = path(
            [TableTh.length - 1, "props", "children"],
            Th,
        ) as ReactNode;
        const theme = useMantineTheme();
        const { colorScheme } = useMantineColorScheme();
        const bgColor =
            colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
        return (
            <Table.Thead>
                <Table.Tr>
                    {TableTh.map((elm, index) => {
                        const isLast = index === TableTh.length - 1;
                        return (
                            <React.Fragment key={index}>
                                {!isLast && elm}
                                {isLast && (
                                    <>
                                        <Table.Th ref={ref}>
                                            {" "}
                                            {TableThLastTitle}
                                        </Table.Th>
                                        <Transition
                                            mounted={isVisible}
                                            transition="scale-x"
                                            duration={500}
                                            timingFunction="ease-out"
                                        >
                                            {(styles) => (
                                                <Table.Th
                                                    style={{
                                                        ...styles,
                                                        position: "sticky",
                                                        top: 0,
                                                        right: 0,
                                                        backgroundColor:
                                                            bgColor,
                                                        padding:
                                                            "var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-lg))",
                                                    }}
                                                >
                                                    {" "}
                                                    {TableThLastTitle}
                                                </Table.Th>
                                            )}
                                        </Transition>
                                    </>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Table.Tr>
            </Table.Thead>
        );
    },
);
const TableResponsiveWrapper: ForwardRefRenderFunction<
    HTMLDivElement,
    TableResponsiveWrapperProps
> = ({ children }, ref) => {
    const tableRowRef = useRef<HTMLTableElement>(null);
    const { childrenRef, isVisible } = useElementVisibility({
        element: tableRowRef,
    });
    return (
        <Flex direction="column" align="center" w="100%">
            <Flex direction="column" align="center" w="100%">
                <Box
                    ref={tableRowRef}
                    style={{ position: "relative", width: "100%" }}
                >
                    <Box style={{ overflowX: "auto", width: "100%" }}>
                        <ResponsiveTable
                            ref={childrenRef}
                            isVisible={isVisible}
                        >
                            {children}
                        </ResponsiveTable>
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
};

export default forwardRef(TableResponsiveWrapper);
