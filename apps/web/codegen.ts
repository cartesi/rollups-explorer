import type { CodegenConfig } from "@graphql-codegen/cli";

const schema = "https://mainnet.api.cartesiscan.io/graphql";

const plugins = [
    {
        add: {
            content:
                'import type { DocumentNode } from "graphql/language/ast";',
        },
    },
    "typescript",
    "typescript-operations",
    "typescript-urql",
];

const config = {
    withHooks: true,
};

console.info(`Codegen will use schema URL: ${schema}`);

const rollupsSchema = "./graphql/rollups/schema.graphql";
const rollupsDocuments = "./graphql/rollups/queries.graphql";

const codegenConfig: CodegenConfig = {
    generates: {
        "src/graphql/index.tsx": {
            schema,
            documents: "./graphql/queries.graphql",
            plugins,
            config,
        },
        "src/graphql/rollups/types.ts": {
            schema: rollupsSchema,
            documents: rollupsDocuments,
            plugins: ["typescript"],
        },
        "src/graphql/rollups/operations.ts": {
            schema: rollupsSchema,
            documents: rollupsDocuments,
            preset: "import-types",
            plugins: ["typescript-operations", "typescript-urql"],
            presetConfig: {
                typesPath: "./types",
            },
            config: {
                withHooks: false,
            },
        },
        "src/graphql/rollups/hooks/queries.tsx": {
            schema: rollupsSchema,
            documents: rollupsDocuments,
            plugins: ["typescript-urql"],
            config: {
                withHooks: true,
                importOperationTypesFrom: "Operations",
                documentMode: "external",
                importDocumentNodeExternallyFrom: "../operations.tsx",
            },
        },
    },
};

export default codegenConfig;
