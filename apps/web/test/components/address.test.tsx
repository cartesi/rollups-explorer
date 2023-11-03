import { cleanup, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import Address from "../../src/components/address";
import withMantineTheme from "../utils/WithMantineTheme";

const AddressE = withMantineTheme(Address);
const portalAddr = "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB";
const unknowAddr = "0x775c80fd1DE1b466d7eB611b45067c4394247274";

describe("Address Component", () => {
    afterEach(() => cleanup());

    it("should display the name when address is from ERC20Portal", () => {
        render(<AddressE value={portalAddr} />);

        expect(screen.getByText("ERC20Portal")).toBeInTheDocument();
    });

    it("should display the full address when is not known address", () => {
        render(<AddressE value={unknowAddr} />);

        expect(screen.getByText(unknowAddr)).toBeInTheDocument();
    });

    it("should display a shorten version of the address for not known address", () => {
        render(<AddressE value={unknowAddr} shorten />);

        expect(screen.getByText("0x775c80...247274")).toBeInTheDocument();
    });

    it("should display jazzicon when enabled", () => {
        const { container } = render(<AddressE value={portalAddr} icon />);

        const jazzEls = container.querySelectorAll(".paper");
        expect(jazzEls.length).toEqual(1);
        expect(jazzEls[0].querySelector("svg")).toBeInTheDocument();
    });

    it("should wrap the address text with a link to the correct place", () => {
        const { container } = render(
            <AddressE
                value={portalAddr}
                href={`https://etherscan.io/address/${portalAddr}`}
            />,
        );

        expect(screen.getByRole("link")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveProperty(
            "href",
            `https://etherscan.io/address/${portalAddr}`,
        );
    });
});
