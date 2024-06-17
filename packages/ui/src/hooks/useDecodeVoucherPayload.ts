import {
    decodeVoucherPayload,
    DecodeVoucherPayloadParamsType,
} from "@cartesi/decoder";
import { useEffect, useMemo, useState } from "react";
export const useDecodeVoucherPayload = (
    content: string | DecodeVoucherPayloadParamsType,
) => {
    const { destination, payload } =
        content as unknown as DecodeVoucherPayloadParamsType;
    const [data, setData] = useState<unknown | string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    useEffect(() => {
        const decodePayload = async () => {
            setLoading(true);
            try {
                const decodedData = await decodeVoucherPayload({
                    destination,
                    payload,
                });
                setData(decodedData);
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error("An error occurred"),
                );
                setData(payload); // Fallback value for raw value.
            } finally {
                setLoading(false);
            }
        };
        if (typeof content !== "string") {
            decodePayload();
        } else {
            setData(content);
        }
    }, [destination, payload]);

    return useMemo(() => ({ data, loading, error }), [data, loading, error]);
};
