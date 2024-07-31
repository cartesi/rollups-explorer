import {
    Accordion,
    Button,
    Collapse,
    Indicator,
    Table,
    Title,
    rem,
} from "@mantine/core";
import { pathOr, reject } from "ramda";
import { TbTrash } from "react-icons/tb";
import { DepositData, useFormContext } from "./context";

const DepositBatchReview = () => {
    const form = useFormContext();
    const deposits: DepositData[] = pathOr([], ["values", "batch"], form);

    const rows = deposits.map((deposit, idx) => (
        <Table.Tr
            key={deposit.id}
            data-testid={`${idx}-${deposit.tokenId}-${deposit.amount}`}
        >
            <Table.Td>{deposit.tokenId.toString()}</Table.Td>
            <Table.Td>{deposit.name ?? "Not defined"}</Table.Td>
            <Table.Td>{deposit.amount.toString()}</Table.Td>
            <Table.Td>
                <Button
                    size="compact-sm"
                    color="red"
                    onClick={() => {
                        const newVal = reject(
                            (i: DepositData) => i.id === deposit.id,
                            deposits,
                        );
                        form.setFieldValue("batch", newVal);
                        form.validateField("batch");
                    }}
                >
                    <TbTrash />
                </Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Collapse in={deposits.length > 0}>
            <Accordion variant="contained" chevronPosition="right" py="sm">
                <Indicator label={deposits.length} size={rem(21)}>
                    <Accordion.Item
                        value="deposits-review"
                        key="deposits-review"
                    >
                        <Accordion.Control>
                            <Title order={4}>Deposits for review</Title>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <Table
                                horizontalSpacing="xl"
                                highlightOnHover
                                data-testid="batch-review-table"
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            Id
                                        </Table.Th>
                                        <Table.Th
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            Name
                                        </Table.Th>
                                        <Table.Th
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            Amount
                                        </Table.Th>
                                        <Table.Th
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            Action
                                        </Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rows}</Table.Tbody>
                            </Table>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Indicator>
            </Accordion>
        </Collapse>
    );
};

export default DepositBatchReview;
