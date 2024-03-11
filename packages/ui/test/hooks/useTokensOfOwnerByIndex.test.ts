import { describe, it } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import useTokensOfOwnerByIndex from "../../src/hooks/useTokensOfOwnerByIndex";
import { Address, useContractReads } from "wagmi";

vi.mock("@cartesi/rollups-wagmi");

vi.mock("wagmi");
const mockUseContractReads = vi.mocked(useContractReads, true);

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@mantine/form", async () => {
    const actual = await vi.importActual("@mantine/form");
    return {
        ...(actual as any),
        useForm: (actual as any).useForm,
    };
});

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];
const contracts = [
    "0x569DABb4F67770cc094d09Fe4bf4202557d2f456",
    "0xaca048D528383cCf84d0edd511130E91eAF6d55C",
    "0x25CbF5d10Eb0C1B3eC81Eb9Ca4B6f8AE4275f958",
];
describe("useTokensOfOwnerByIndex hook", () => {
    beforeEach(() => {
        mockUseContractReads.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [
                {
                    result: undefined,
                    error: undefined,
                },
                {
                    result: undefined,
                    error: undefined,
                },
            ],
        } as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it('should return an empty list with token ids when "erc721ContractAddress" is undefined', () => {
        const [address] = applications;
        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                undefined as unknown as Address,
                address as Address,
            ),
        );

        expect(result.current.tokenIds.length).toBe(0);
    });

    it('should return an empty list with token ids when "ownerAddress" are undefined', () => {
        const [erc721ContractAddress] = contracts;
        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                erc721ContractAddress as Address,
                undefined as unknown as Address,
            ),
        );

        expect(result.current.tokenIds.length).toBe(0);
    });

    it("should return a list with one token id when data for token ids contain only one entry", () => {
        const [erc721ContractAddress] = contracts;
        const [address] = applications;

        mockUseContractReads.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [
                {
                    result: 1n,
                    status: "success",
                },
            ],
        } as any);

        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                erc721ContractAddress as Address,
                address as Address,
            ),
        );

        expect(result.current.tokenIds.length).toBe(1);
        expect(result.current.tokenIds[0]).toBe(1n);
    });

    it("should return a list with multiple token id when data for token ids contain multiple entries", () => {
        const [erc721ContractAddress] = contracts;
        const [address] = applications;
        const data = [
            {
                result: 1n,
                status: "success",
            },
            {
                result: 2n,
                status: "success",
            },
            {
                result: 3n,
                status: "success",
            },
        ];

        const implementation = (config: any) => {
            const [contractData] = config.contracts;
            return {
                isLoading: false,
                isSuccess: true,
                data: [data[Number(contractData.args[1])]],
            };
        };
        mockUseContractReads.mockImplementation(implementation as any);

        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                erc721ContractAddress as Address,
                address as Address,
            ),
        );

        expect(result.current.tokenIds.length).toBe(data.length);

        data.forEach((entry, entryIndex) => {
            expect(entry.result).toBe(result.current.tokenIds[entryIndex]);
        });
    });

    it("should return a filtered list with token ids excluding already deposited tokens", () => {
        const [erc721ContractAddress] = contracts;
        const [address] = applications;
        const data = [
            {
                result: 1n,
                status: "success",
            },
            {
                result: 2n,
                status: "success",
            },
            {
                result: 3n,
                status: "success",
            },
        ];

        const implementation = (config: any) => {
            const [contractData] = config.contracts;
            return {
                isLoading: false,
                isSuccess: true,
                data: [data[Number(contractData.args[1])]],
            };
        };
        mockUseContractReads.mockImplementation(implementation as any);

        const depositedToken = 1n;
        const depositedTokens = [depositedToken];
        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                erc721ContractAddress as Address,
                address as Address,
                depositedTokens,
            ),
        );

        expect(result.current.tokenIds.length).toBe(data.length - 1);
        expect(
            result.current.tokenIds.find(
                (tokenId: bigint) => tokenId === depositedToken,
            ),
        ).toBe(undefined);
    });

    it("should return an empty list when data for token ids contains no entries", () => {
        const [erc721ContractAddress] = contracts;
        const [address] = applications;

        mockUseContractReads.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [],
        } as any);

        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                erc721ContractAddress as Address,
                address as Address,
            ),
        );

        expect(result.current.tokenIds.length).toBe(0);
    });

    it("should return an empty list when 'tokenOfOwnerByIndex' is unavailable", () => {
        const [erc721ContractAddress] = contracts;
        const [address] = applications;

        mockUseContractReads.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: [
                {
                    result: undefined,
                    status: "failure",
                    error: {},
                },
            ],
        } as any);

        const { result } = renderHook(() =>
            useTokensOfOwnerByIndex(
                erc721ContractAddress as Address,
                address as Address,
            ),
        );

        expect(result.current.tokenIds.length).toBe(0);
    });
});
