import { z } from "zod";

export const fetchFunctionInterfaceOpenApiSchema = z.object({
  ok: z.boolean(),
  result: z.object({
    function: z.record(
      z
        .array(
          z.object({
            name: z.string(),
            filtered: z.boolean(),
          })
        )
        .optional()
    ),
    event: z.record(
      z
        .array(
          z.object({
            name: z.string(),
            filtered: z.boolean(),
          })
        )
        .optional()
    ),
  }),
});

export const fetchFunctionInterface4ByteSchema = z.object({
  count: z.number(),
  results: z.array(
    z.object({
      id: z.number(),
      created_at: z.string(),
      text_signature: z.string(),
      hex_signature: z.string(),
    })
  ),
});

export const fetchContractAbiResponseSchema = z.object({
  abi: z.array(z.unknown()),
  name: z.string(),
});