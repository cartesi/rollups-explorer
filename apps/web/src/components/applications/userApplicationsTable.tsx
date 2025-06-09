import {
    Button,
    Loader,
    Table,
    Text,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { FC, useCallback, useRef, useState } from "react";
import { Application } from "@cartesi/rollups-explorer-domain/explorer-types";
import { ApplicationsTableProps } from "./applicationsTable";
import UserApplicationsRow from "./userApplicationsRow";
import { useElementVisibility } from "../../hooks/useElementVisibility";
import TableResponsiveWrapper from "../tableResponsiveWrapper";

interface UserApplicationsTableProps extends ApplicationsTableProps {
    noResultsMessage?: string;
}

const UserApplicationsTable: FC<UserApplicationsTableProps> = (props) => {
    const {
        applications,
        fetching,
        totalCount,
        noResultsMessage = "No applications",
    } = props;
    const tableRowRef = useRef<HTMLDivElement>(null);
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const bgColor = colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
    const { childrenRef, isVisible } = useElementVisibility({
        element: tableRowRef,
    });
    const [timeType, setTimeType] = useState<"timestamp" | "age">("age");

    const onChangeTimeColumnType = useCallback(() => {
        setTimeType((timeType) => (timeType === "age" ? "timestamp" : "age"));
    }, []);

    return (
        <TableResponsiveWrapper ref={tableRowRef}>
            <Table width={"100%"} style={{ borderCollapse: "collapse" }}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Id</Table.Th>
                        <Table.Th>URL</Table.Th>
                        <Table.Th>
                            <Button
                                variant="transparent"
                                px={0}
                                onClick={onChangeTimeColumnType}
                            >
                                {timeType === "age" ? "Age" : "Timestamp (UTC)"}
                            </Button>
                        </Table.Th>
                        <Table.Th ref={childrenRef}>Data</Table.Th>
                        <Transition
                            mounted={isVisible}
                            transition="scale-x"
                            duration={500}
                            timingFunction="ease-out"
                        >
                            {(styles) => (
                                <th
                                    style={{
                                        ...styles,
                                        position: "sticky",
                                        top: 0,
                                        right: 0,
                                        backgroundColor: bgColor,
                                        padding:
                                            "var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-lg))",
                                    }}
                                >
                                    Data
                                </th>
                            )}
                        </Transition>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {fetching ? (
                        <Table.Tr>
                            <Table.Td align="center" colSpan={4}>
                                <Loader />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={4} align="center">
                                    <Text fw={700}>{noResultsMessage}</Text>
                                </Table.Td>
                            </Table.Tr>
                        )
                    )}
                    {applications.map((application) => (
                        <UserApplicationsRow
                            key={application.id}
                            application={
                                application as Omit<Application, "inputs">
                            }
                            timeType={timeType}
                            keepDataColVisible={!isVisible}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default UserApplicationsTable;
