/* eslint-disable react-refresh/only-export-components */
import { MantineProvider } from "@mantine/core";
import { render, type RenderOptions } from "@testing-library/react";
import theme from "../src/providers/theme";

const WithProviders = ({ children }: { children: React.ReactNode }) => {
    return <MantineProvider theme={theme}>{children}</MantineProvider>;
};

const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: WithProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
