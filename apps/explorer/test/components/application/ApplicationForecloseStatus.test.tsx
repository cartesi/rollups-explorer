import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { ApplicationForecloseStatus } from "../../../src/components/application/ApplicationForecloseStatus";
import { content } from "../../../src/content";
import { createApplication, render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return {
        ...actual,
        useConfig: vi.fn(),
    };
});

const useConfigMock = vi.mocked(useConfig, { partial: true });

describe("ApplicationForecloseStatus", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({ chains: [mainnet] });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("shows that withdrawals cannot be requested when the accounts drive is not proved", () => {
        render(
            <ApplicationForecloseStatus application={createApplication()} />,
        );

        expect(
            screen.getByText(content.foreclose.application.isForeclosed),
        ).toBeVisible();
        expect(
            screen.getByText(content.withdrawal.accountsDrive.notProved),
        ).toBeVisible();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("shows the proving transaction when the accounts drive is proved", () => {
        const transactionHash =
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const application = createApplication({
            accountsDriveProvedBlock: 42n,
            accountsDriveProvedTransaction: transactionHash,
        });

        render(<ApplicationForecloseStatus application={application} />);

        expect(
            screen.getByText(content.withdrawal.accountsDrive.proved),
        ).toBeVisible();
        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            `https://etherscan.io/tx/${transactionHash}`,
        );
    });
});
