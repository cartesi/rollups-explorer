/* eslint-disable react-refresh/only-export-components */
import type { Application, Withdrawal } from "@cartesi/client";
import { MantineProvider } from "@mantine/core";
import { render, type RenderOptions } from "@testing-library/react";
import { zeroHash } from "viem";
import theme from "../src/providers/theme";

const WithProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider theme={theme} env="test">
            {children}
        </MantineProvider>
    );
};

const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: WithProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

type ApplicationOverrides = Partial<
    Pick<
        Application,
        | "applicationAddress"
        | "accountsDriveProvedBlock"
        | "accountsDriveProvedTransaction"
        | "forecloseBlock"
        | "forecloseTransaction"
        | "name"
        | "withdrawalConfig"
    >
>;

export const createApplication = (overrides?: ApplicationOverrides) =>
    ({
        name: "My App",
        applicationAddress: "0x1234567890abcdef1234567890abcdef12345678",
        accountsDriveProvedBlock: 0n,
        accountsDriveProvedTransaction: zeroHash,
        forecloseBlock: 0n,
        forecloseTransaction: zeroHash,
        ...overrides,
    }) as Application;

export const createWithdrawal = (overrides: Partial<Withdrawal> = {}) =>
    ({
        accountIndex: 1n,
        account: "0x1234567890abcdef1234567890abcdef12345678",
        output: "0x12345678",
        transactionHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        ...overrides,
    }) as Withdrawal;
