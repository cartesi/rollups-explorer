import { describe, expect, it } from "vitest";
import { foundry, mainnet } from "wagmi/chains";
import { BlockExplorerLink } from "../../src/components/BlockExplorerLink";
import { shortenHash } from "../../src/lib/textUtils";
import { render, screen } from "../test-utils";

const tx =
    "0x6df905972a0cf0ccdd1ea6d5fef826ebca52b728b4638118ca89a1b8b757a26a" as const;

describe("BlockExplorerLink Component", () => {
    it("should render nothing when chain does not have an explorer URL.", () => {
        render(<BlockExplorerLink type="tx" value="0x1" chain={foundry} />);

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("should render the anchor and shorten hash for valid chains", () => {
        render(<BlockExplorerLink type="tx" value={tx} chain={mainnet} />);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", `https://etherscan.io/tx/${tx}`);
        expect(screen.getByText(shortenHash(tx))).toBeVisible();
    });
});
