import type { CodegenConfig } from "@graphql-codegen/cli";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { join, sep } from "path";

const basePath = join("src", "graphql");
const rollupsBasePath = join("graphql", "rollups");
// FIXUP: to be replaced with new deployed API.
const explorerSchema =
    process.env.NEXT_PUBLIC_PREVIEW_EXPLORER_API_URL ??
    "https://api.cartesiscan.io/graphql";
const explorerAPIQueries = join(".", "graphql", "queries.graphql");
const rollupsSchema = join(".", rollupsBasePath, "schema.graphql");
const rollupsDocuments = join(".", rollupsBasePath, "queries.graphql");
const rollupsV2Schema = join(".", rollupsBasePath, "v2", "schema.graphql");
const rollupsV2Documents = join(".", rollupsBasePath, "v2", "queries.graphql");

console.info(`Codegen will use schema URL: ${explorerSchema}`);

interface CommonConfig extends Pick<Types.Config, "schema" | "documents"> {
    dirname: string;
}

type Generates = Partial<Pick<Types.Config, "generates">>;

const setup: CommonConfig[] = [
    {
        dirname: "rollups/v2",
        schema: rollupsV2Schema,
        documents: rollupsV2Documents,
    },
    {
        dirname: "rollups",
        schema: rollupsSchema,
        documents: rollupsDocuments,
    },
    {
        dirname: "explorer",
        schema: explorerSchema,
        documents: explorerAPIQueries,
    },
];

const generateConfig = (configs: CommonConfig[]): Generates => {
    return configs.reduce<Generates>(
        (generates, { dirname, documents, schema }) => {
            const path = join(basePath, dirname);

            return {
                ...generates,
                [join(path, "types.ts")]: {
                    schema,
                    documents,
                    plugins: ["typescript"],
                },
                [join(path, "operations.ts")]: {
                    schema,
                    documents,
                    preset: "import-types",
                    plugins: [
                        "typescript-operations",
                        "typescript-urql",
                        "named-operations-object",
                    ],
                    presetConfig: {
                        typesPath: `.${sep}types`,
                    },
                    config: {
                        withHooks: false,
                        // named-operations-object plugin configs
                        enumAsTypes: true,
                        useConsts: true,
                        identifierName: "allOperations",
                    },
                },
                [join(path, "hooks", "queries.tsx")]: {
                    schema,
                    documents,
                    plugins: ["typescript-urql"],
                    config: {
                        withHooks: true,
                        importOperationTypesFrom: "Operations",
                        documentMode: "external",
                        importDocumentNodeExternallyFrom: join(
                            "..",
                            "operations.ts",
                        ),
                    },
                },
            };
        },
        {},
    );
};

const codegenConfig: CodegenConfig = {
    generates: {
        ...generateConfig(setup),
    },
};

export default codegenConfig;
