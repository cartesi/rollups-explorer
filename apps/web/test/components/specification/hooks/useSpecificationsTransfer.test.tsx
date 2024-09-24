import { describe, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSpecificationsTransfer } from "../../../../src/components/specification/hooks/useSpecificationsTransfer";
import { JotaiTestProvider } from "../jotaiHelpers";
import { specificationsAtom } from "../../../../src/components/specification/hooks/useSpecification";
import { defaultSpecificationExport } from "../stubs";
import { act } from "react";

describe("useSpecificationsTransfer hook", () => {
    it("should return correct export link", () => {
        const { result } = renderHook(() => useSpecificationsTransfer(), {
            wrapper: ({ children }) => (
                <JotaiTestProvider
                    initialValues={[
                        [
                            specificationsAtom,
                            defaultSpecificationExport.specifications,
                        ],
                    ]}
                >
                    {children}
                </JotaiTestProvider>
            ),
        });

        act(() => {
            expect(result.current.specificationExportLink).toBe(
                `data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(result.current.specificationExport, null, 4),
                )}`,
            );
        });
    });
});
