import type { CodegenConfig } from "@graphql-codegen/cli";

const schema = process.env.NEXT_PUBLIC_EXPLORER_API_URL;

if (!schema)
    throw new Error(
        "NEXT_PUBLIC_EXPLORER_API_URL environment variable is required for GraphQL code generation.",
    );

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

const codegenConfig: CodegenConfig = {
    schema,
    documents: "./graphql/queries.graphql",
    generates: {
        "src/graphql/index.tsx": {
            plugins,
            config,
        },
    },
};

export default codegenConfig;
