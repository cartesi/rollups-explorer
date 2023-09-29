import type { CodegenConfig } from "@graphql-codegen/cli";

const schema = "https://squid.subsquid.io/cartesi-rollups-mainnet/graphql";
// const schema = "https://squid.subsquid.io/cartesi-rollups-sepolia/graphql";
// const schema = "http://127.0.0.1:4350/graphql";

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
