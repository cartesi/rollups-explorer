import { expect, test } from "vitest";
import {
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    cannon,
    foundry,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "wagmi/chains";
import {
    checkChainId,
    defaultSupportedChain,
    default as getSupportedChainInfo,
    isDevnet,
    supportedChains,
} from "../../src/lib/supportedChains";

test("supportedChains should contain the expected chains", () => {
    const expectedChainIds = [
        mainnet.id,
        sepolia.id,
        base.id,
        baseSepolia.id,
        optimism.id,
        optimismSepolia.id,
        foundry.id,
        cannon.id,
        arbitrum.id,
        arbitrumSepolia.id,
    ];

    const actualChainIds = Object.keys(supportedChains).map(Number);
    expect(actualChainIds).toEqual(expect.arrayContaining(expectedChainIds));
});

test("checkChainId should return supported status and chain configuration for supported chain IDs", () => {
    expect(checkChainId(mainnet.id)).toEqual({
        status: "supported",
        chain: mainnet,
    });
    expect(checkChainId(sepolia.id)).toEqual({
        status: "supported",
        chain: sepolia,
    });
    expect(checkChainId(base.id)).toEqual({ status: "supported", chain: base });
    expect(checkChainId(baseSepolia.id)).toEqual({
        status: "supported",
        chain: baseSepolia,
    });
    expect(checkChainId(optimism.id)).toEqual({
        status: "supported",
        chain: optimism,
    });
    expect(checkChainId(optimismSepolia.id)).toEqual({
        status: "supported",
        chain: optimismSepolia,
    });
    expect(checkChainId(foundry.id)).toEqual({
        status: "supported",
        chain: foundry,
    });
    expect(checkChainId(cannon.id)).toEqual({
        status: "supported",
        chain: cannon,
    });
    expect(checkChainId(arbitrum.id)).toEqual({
        status: "supported",
        chain: arbitrum,
    });
    expect(checkChainId(arbitrumSepolia.id)).toEqual({
        status: "supported",
        chain: arbitrumSepolia,
    });
});

test("checkChainId should return not-supported-chain status and error object for unsupported chain IDs", () => {
    expect(checkChainId(9999)).toEqual({
        status: "not-supported-chain",
        error: new Error(
            `9999 is not supported. Supported chains: [ ${Object.keys(supportedChains).join(", ")} ]`,
        ),
    });
});

test("isDevnet should return true for devnet chain IDs", () => {
    expect(isDevnet(foundry.id)).toBe(true);
    expect(isDevnet(cannon.id)).toBe(true);
});

test("isDevnet should return false for non-devnet chain IDs", () => {
    expect(isDevnet(mainnet.id)).toBe(false);
    expect(isDevnet(sepolia.id)).toBe(false);
    expect(isDevnet(base.id)).toBe(false);
    expect(isDevnet(baseSepolia.id)).toBe(false);
    expect(isDevnet(optimism.id)).toBe(false);
    expect(isDevnet(optimismSepolia.id)).toBe(false);
    expect(isDevnet(arbitrum.id)).toBe(false);
    expect(isDevnet(arbitrumSepolia.id)).toBe(false);
});

test("getSupportedChainInfo should return chain metadata for a supported id", () => {
    expect(getSupportedChainInfo(mainnet.id)).toEqual(mainnet);
    expect(getSupportedChainInfo(sepolia.id)).toEqual(sepolia);
    expect(getSupportedChainInfo(base.id)).toEqual(base);
    expect(getSupportedChainInfo(baseSepolia.id)).toEqual(baseSepolia);
    expect(getSupportedChainInfo(optimism.id)).toEqual(optimism);
    expect(getSupportedChainInfo(optimismSepolia.id)).toEqual(optimismSepolia);
    expect(getSupportedChainInfo(foundry.id)).toEqual(foundry);
    expect(getSupportedChainInfo(cannon.id)).toEqual(cannon);
    expect(getSupportedChainInfo(arbitrum.id)).toEqual(arbitrum);
    expect(getSupportedChainInfo(arbitrumSepolia.id)).toEqual(arbitrumSepolia);
});

test("getSupportedChainInfo should return undefined for an unsupported id", () => {
    const randomChainId = 9999;
    // @ts-expect-error testing unsupported chain id
    expect(getSupportedChainInfo(randomChainId)).toBeUndefined();
});

test("defaultSupportedChain should point to foundry", () => {
    expect(defaultSupportedChain).toEqual(foundry);
});
