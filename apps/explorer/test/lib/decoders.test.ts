import { describe, expect, test, vi } from "vitest";
import { asJson, asText, getDecoder } from "../../src/lib/decoders";

describe("decoders", () => {
    test("asText should decode hex content", () => {
        expect(asText("0x68656c6c6f")).toBe("hello");
    });

    test("asText should return plain text content unchanged", () => {
        expect(asText("plain-text")).toBe("plain-text");
    });

    test("asJson should prettify JSON text", () => {
        expect(asJson('{"a":1,"b":"ok"}')).toBe('{\n  "a": 1,\n  "b": "ok"\n}');
    });

    test("asJson should decode hex and prettify JSON", () => {
        expect(asJson("0x7b2261223a317d")).toBe('{\n  "a": 1\n}');
    });

    test("asJson should return original content on parse errors", () => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        expect(asJson("not-json")).toBe("not-json");
        expect(errorSpy).toHaveBeenCalled();

        errorSpy.mockRestore();
    });

    test("getDecoder should return the text decoder", () => {
        const decoder = getDecoder("text");
        expect(decoder("0x6869")).toBe("hi");
    });

    test("getDecoder should return the json decoder", () => {
        const decoder = getDecoder("json");
        expect(decoder('{"ok":true}')).toBe('{\n  "ok": true\n}');
    });

    test("getDecoder should return identity function for unsupported decoder types", () => {
        const decoder = getDecoder("unknown" as never);
        expect(decoder("value")).toBe("value");
    });
});
