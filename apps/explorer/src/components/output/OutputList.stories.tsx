import type { GetOutputReturnType } from "@cartesi/viem";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { OutputList } from "./OutputList";

const meta = {
    title: "Components/Output/OutputList",
    component: OutputList,
    tags: ["autodocs"],
} satisfies Meta<typeof OutputList>;

export default meta;
type Story = StoryObj<typeof meta>;

const validVoucher: GetOutputReturnType = {
    epochIndex: 1n,
    inputIndex: 1n,
    index: 1n,
    rawData:
        "0x237a816f000000000000000000000000c3e53f4d16ae77db1c982e75a937b9f60fe63690000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000a074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000bdbc41e0348b30000000000000000000000000000000000000000000000000000000000000",
    hash: "0x568f6025a01afa779e1db16825bd4f6ca0ffe62285373be4c08ef79e31711a6d",
    outputHashesSiblings: null,
    executionTransactionHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    decodedData: {
        type: "Voucher",
        destination: "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690",
        value: 0n,
        payload:
            "0xa9059cbb000000000000000000000000a074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000bdbc41e0348b300000",
    },
};
const validNotice: GetOutputReturnType = {
    epochIndex: 1n,
    inputIndex: 1n,
    index: 2n,
    rawData:
        "0xc258d6e5000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000847b22616374696f6e223a2265726332305f6465706f736974222c2264617461223a7b226d7367223a22576974686472617720766f7563686572206f662033353030204552432d323020746f203078613037343638334235424530313546303533623544636562303634433431664339443131423645352067656e6572617465642e227d7d00000000000000000000000000000000000000000000000000000000",
    hash: "0xf1de49ce16cbc7791e2fb8703279b4cb768bb0e54d84e5034b55bb25abba0772",
    outputHashesSiblings: null,
    executionTransactionHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    decodedData: {
        type: "Notice",
        payload:
            "0x7b22616374696f6e223a2265726332305f6465706f736974222c2264617461223a7b226d7367223a22576974686472617720766f7563686572206f662033353030204552432d323020746f203078613037343638334235424530313546303533623544636562303634433431664339443131423645352067656e6572617465642e227d7d",
    },
};

const validEthVoucher: GetOutputReturnType = {
    epochIndex: 1n,
    inputIndex: 1n,
    index: 3n,
    rawData:
        "0x237a816f000000000000000000000000a074683b5be015f053b5dceb064c41fc9d11b6e5000000000000000000000000000000000000000000000028a857425466f8000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
    hash: "0xfdb6a6d2dc04262302bae4b0b39ae40ddb36b8473c1bc09b550fd5cbca300fc5",
    outputHashesSiblings: null,
    executionTransactionHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    decodedData: {
        type: "Voucher",
        destination: "0xa074683B5BE015F053b5Dceb064C41fC9D11B6E5",
        value: 750000000000000000000n,
        payload: "0x",
    },
};

type Props = Parameters<typeof OutputList>[0];

const Wrapper = (props: Props) => {
    const [index, setIndex] = useState<number>(props.pagination.offset);
    const outputs = props.outputs.slice(index, props.pagination.limit + index);

    return (
        <OutputList
            {...props}
            outputs={outputs}
            pagination={{ ...props.pagination, offset: index }}
            onPaginationChange={setIndex}
        />
    );
};

export const SingleOutputPerPage: Story = {
    args: {
        outputs: [validNotice, validVoucher],
        pagination: {
            limit: 1,
            totalCount: 2,
            offset: 0,
        },
        decoderType: "raw",
    },
    render: Wrapper,
};

export const MultipleOutputsPerPage: Story = {
    args: {
        outputs: [
            validNotice,
            validVoucher,
            validEthVoucher,
            {
                ...validEthVoucher,
                index: validEthVoucher.index + 1n,
                decodedData: {
                    type: "Voucher",
                    value: 100000000000000000000n,
                    destination: "0xa074683B5BE015F053b5Dceb064C41fC9D11B6E5",
                    payload: "0x",
                },
            },
        ],
        pagination: {
            limit: 3,
            totalCount: 4,
            offset: 0,
        },
        decoderType: "raw",
    },
    render: Wrapper,
};
