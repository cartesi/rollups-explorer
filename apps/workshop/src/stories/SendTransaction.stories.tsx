import { InputDetails } from "@cartesi/rollups-explorer-ui";
import { SegmentedControl, Select } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DepositType } from "../../../web/src/components/sendTransaction.tsx";

const meta: Meta<typeof InputDetails> = {
    component: InputDetails,
};

export default meta;
type Story = StoryObj<typeof InputDetails>;

const FormWithSegmentedControlComponent = () => {
    const [depositType, setDepositType] = useState("ether");
    const data = [
        {
            value: "ether",
            label: "Ether Deposit",
        },
        {
            value: "erc20",
            label: "ERC-20 Deposit",
        },
        {
            value: "erc721",
            label: "ERC-721 Deposit",
        },
        {
            value: "erc1155",
            label: "ERC-1155 Deposit",
        },
        {
            value: "relay",
            label: "Address Relay",
        },
        {
            value: "input",
            label: "Raw Input",
        },
    ];
    return (
        <div>
            <SegmentedControl
                value={depositType}
                onChange={(nextValue) => {
                    setDepositType(nextValue as DepositType);
                }}
                data={data}
                styles={{ root: { width: "100%" } }}
            />

            <div
                style={{
                    width: "100%",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {data.find((d) => d.value === depositType)?.label}
            </div>
        </div>
    );
};

const FormWithSelectComponent = () => {
    const [depositType, setDepositType] = useState("ether");
    const data = [
        {
            group: "Deposit",
            items: [
                { value: "ether", label: "Ether" },
                { value: "erc20", label: "ERC-20" },
                { value: "erc721", label: "ERC-721" },
                { value: "erc1155", label: "ERC-1155" },
            ],
        },
        {
            group: "Other",
            items: [
                { value: "input", label: "Raw Input" },
                { value: "relay", label: "Address Relay" },
            ],
        },
    ];

    const items = data.reduce<{ value: string; label: string }[]>(
        (accumulator, group) => [...accumulator, ...group.items],
        [],
    );

    return (
        <div>
            <Select
                label="Type"
                placeholder="Select deposit type"
                data={[
                    {
                        group: "Deposit",
                        items: [
                            { value: "ether", label: "Ether" },
                            { value: "erc20", label: "ERC-20" },
                            { value: "erc721", label: "ERC-721" },
                            { value: "erc1155", label: "ERC-1155" },
                        ],
                    },
                    {
                        group: "Other",
                        items: [
                            { value: "input", label: "Raw Input" },
                            { value: "relay", label: "Address Relay" },
                        ],
                    },
                ]}
                value={depositType}
                onChange={(nextValue) => {
                    setDepositType(nextValue as DepositType);
                }}
            />

            <div
                style={{
                    width: "100%",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {items.find((d) => d.value === depositType)?.label}
            </div>
        </div>
    );
};

export const FormWithSegmentedControl: Story = {
    render: () => <FormWithSegmentedControlComponent />,
};

export const FormWithSelect: Story = {
    render: () => <FormWithSelectComponent />,
};
