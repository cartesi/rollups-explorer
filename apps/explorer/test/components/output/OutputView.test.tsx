import type { GetOutputReturnType } from "@cartesi/viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OutputView } from "../../../src/components/output/OutputView";
import { render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useVoucherDecoder: vi.fn(),
}));

vi.mock(
    "../../../src/components/specification/hooks/useVoucherDecoder",
    () => ({
        default: mocks.useVoucherDecoder,
    }),
);

vi.mock("../../../src/components/output/OutputExecution", () => ({
    default: () => <div data-testid="output-execution" />,
}));

vi.mock("../../../src/components/Address", () => ({
    default: ({ value }: { value: string }) => <span>{value}</span>,
}));

vi.mock("../../../src/components/JSONViewer", () => ({
    default: ({ content }: { content: unknown }) => (
        <div data-testid="json-viewer">{JSON.stringify(content)}</div>
    ),
}));

vi.mock("../../../src/hooks/useIsSmallDevice", () => ({
    useIsSmallDevice: () => ({ isSmallDevice: false }),
}));

const application = "0x1234567890abcdef1234567890abcdef12345678";

const createOutput = (
    overrides: Partial<GetOutputReturnType> = {},
): GetOutputReturnType =>
    ({
        index: 1n,
        epochIndex: 2n,
        inputIndex: 3n,
        rawData: "0x",
        hash: null,
        outputHashesSiblings: null,
        executionTransactionHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        decodedData: { type: "Notice", payload: "0x6869" },
        ...overrides,
    }) as GetOutputReturnType;

describe("OutputView", () => {
    beforeEach(() => {
        mocks.useVoucherDecoder.mockReturnValue({ data: undefined });
    });

    it("renders notice payloads using the selected decoder", () => {
        render(
            <OutputView
                application={application}
                output={createOutput()}
                displayAs="text"
            />,
        );

        expect(screen.getByText("hi")).toBeVisible();
        expect(
            screen.queryByTestId("output-execution"),
        ).not.toBeInTheDocument();
    });

    it("renders decoded voucher payloads and execution controls", () => {
        mocks.useVoucherDecoder.mockReturnValue({ data: { approved: true } });
        render(
            <OutputView
                application={application}
                output={createOutput({
                    decodedData: {
                        type: "Voucher",
                        destination: application,
                        value: 1000000000000000000n,
                        payload: "0x1234",
                    },
                })}
                displayAs="decoded"
            />,
        );

        expect(screen.getByText("1")).toBeVisible();
        expect(screen.getByTestId("json-viewer")).toHaveTextContent(
            '{"approved":true}',
        );
        expect(screen.getByTestId("output-execution")).toBeVisible();
    });

    it("renders delegate-call vouchers", () => {
        render(
            <OutputView
                application={application}
                output={createOutput({
                    decodedData: {
                        type: "DelegateCallVoucher",
                        destination: application,
                        payload: "0x1234",
                    },
                })}
            />,
        );

        expect(screen.getByTestId("output-execution")).toBeVisible();
    });

    it("renders nothing for outputs without decoded data", () => {
        const { container } = render(
            <OutputView
                application={application}
                output={createOutput({ decodedData: undefined })}
            />,
        );

        expect(container.querySelector("fieldset")).toBeNull();
    });
});
