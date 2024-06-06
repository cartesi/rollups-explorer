import {
    Box,
    Flex,
    Paper,
    Table,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { path } from "ramda";
import React, {
    Children,
    createContext,
    FC,
    forwardRef,
    ReactNode,
    useContext,
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

const VisibilityContext = createContext<boolean>(false);
export const TBodyModifier: FC<TableResponsiveWrapperProps> = ({
    children,
}) => {
    const isDataColVisible = useContext(VisibilityContext);
    const TdArray = React.Children.toArray(children);
    const TdLastContent = path(
        [TdArray.length - 1, "props", "children"],
        children,
    ) as ReactNode;
    return (
        <>
            {TdArray.map((elm, index) => {
                const isLast = index === TdArray.length - 1;
                return (
                    <React.Fragment key={index}>
                        {!isLast && elm}
                        {isLast && (
                            <Table.Td
                                pos={!isDataColVisible ? "initial" : "sticky"}
                                top={0}
                                right={0}
                                p={0}
                            >
                                <Paper
                                    shadow={
                                        !isDataColVisible ? undefined : "xl"
                                    }
                                    radius={0}
                                    p="var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-xs))"
                                >
                                    {TdLastContent}
                                </Paper>
                            </Table.Td>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

const THeadModifier = forwardRef<HTMLTableCellElement, ResponsiveTableProps>(
    ({ children, isVisible }, ref) => {
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

const ResponsiveTable = forwardRef<HTMLTableCellElement, ResponsiveTableProps>(
    ({ children, isVisible }, ref) => {
        const Thead = path(["props", "children", "0"], children) as ReactNode;
        const Tbody = path(["props", "children", "1"], children) as ReactNode;
        return (
            <Table width={"100%"} style={{ borderCollapse: "collapse" }}>
                <THeadModifier ref={ref} isVisible={isVisible}>
                    {Thead}
                </THeadModifier>
                {Tbody}
            </Table>
        );
    },
);

const TableResponsiveWrapper: React.FC<TableResponsiveWrapperProps> = ({
    children,
}) => {
    const tableRowRef = useRef<HTMLTableElement>(null);
    const { childrenRef, isVisible } = useElementVisibility({
        element: tableRowRef,
    });

    return (
        <VisibilityContext.Provider value={isVisible}>
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
        </VisibilityContext.Provider>
    );
};
TableResponsiveWrapper.displayName = "TableResponsiveWrapper";
ResponsiveTable.displayName = "ResponsiveTable";
THeadModifier.displayName = "THeadModifier ";
TBodyModifier.displayName = "TBodyModifier";

export default TableResponsiveWrapper;
