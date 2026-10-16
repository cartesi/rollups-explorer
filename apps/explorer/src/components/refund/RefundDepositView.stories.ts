import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, parseUnits, toHex } from "viem";
import { refundErrorMessage } from "./lib/refundUtils";
import { depositor, token } from "../../stories/deposits";
import { RefundDepositView } from "./RefundDepositView";

const meta = {
    title: "Components/Refund/RefundDepositView",
    component: RefundDepositView,
    tags: ["autodocs"],
} satisfies Meta<typeof RefundDepositView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An Ether deposit that can be refunded. */
export const Ether: Story = {
    args: {
        status: "refundable",
        asset: { kind: "ether", depositor, value: parseUnits("1.5", 18) },
    },
};

/** An ERC-20 deposit, with the token symbol and decimals read on chain. */
export const Erc20: Story = {
    args: {
        status: "refundable",
        asset: {
            kind: "erc20",
            depositor,
            token,
            value: parseUnits("1.5", 6),
            symbol: "USDC",
            decimals: 6,
        },
    },
};

/** An ERC-20 deposit whose token exposes no metadata: raw units and the token address are shown instead. */
export const Erc20WithoutMetadata: Story = {
    args: {
        status: "refundable",
        asset: {
            kind: "erc20",
            depositor,
            token,
            value: parseUnits("1.5", 6),
        },
    },
};

/** An ERC-721 deposit. */
export const Erc721: Story = {
    args: {
        status: "refundable",
        asset: {
            kind: "erc721",
            depositor,
            token,
            tokenId: 7n,
            symbol: "BAYC",
        },
    },
};

/** A single ERC-1155 deposit: three units of token id 7. */
export const Erc1155: Story = {
    args: {
        status: "refundable",
        asset: {
            kind: "erc1155",
            depositor,
            token,
            tokenId: 7n,
            value: 3n,
            symbol: "GAME",
        },
    },
};

/** A batch ERC-1155 deposit lists every token id with its amount. */
export const Erc1155Batch: Story = {
    args: {
        status: "refundable",
        asset: {
            kind: "erc1155-batch",
            depositor,
            token,
            symbol: "GAME",
            items: [
                { tokenId: 7n, value: 3n },
                { tokenId: 9n, value: 1n },
                { tokenId: 12n, value: 25n },
            ],
        },
    },
};

/** The refund transaction was sent and is being mined. */
export const Refunding: Story = {
    args: { ...Ether.args, status: "refunding" },
};

/** The refund was confirmed. */
export const Refunded: Story = {
    args: {
        ...Ether.args,
        status: "refunded",
        transactionHash: keccak256(toHex("refund")),
    },
};

/** Reverted with `RefundAlreadyIssued`: Someone already issued this refund. */
export const ErrorRefundAlreadyIssued: Story = {
    args: {
        ...Ether.args,
        status: "failed",
        errorMessage: refundErrorMessage({ revertName: "RefundAlreadyIssued" }),
    },
};

/** Reverted with `InsufficientFunds`: The application holds less Ether than the deposit being refunded. */
export const ErrorInsufficientFunds: Story = {
    args: {
        ...Ether.args,
        status: "failed",
        errorMessage: refundErrorMessage({ revertName: "InsufficientFunds" }),
    },
};

/** The token contract rejected the transfer and its reason string bubbled up through the refund call. */
export const ErrorTokenReverted: Story = {
    args: {
        ...Erc20.args,
        status: "failed",
        errorMessage: refundErrorMessage({
            reason: "ERC20: transfer amount exceeds balance",
        }),
    },
};

/** The transaction failed for a reason that could not be decoded. */
export const ErrorUnknown: Story = {
    args: {
        ...Ether.args,
        status: "failed",
        errorMessage: refundErrorMessage(),
    },
};

/** The on-chain refund status is still being read. */
export const Loading: Story = {
    args: { ...Ether.args, status: "unknown" },
};
