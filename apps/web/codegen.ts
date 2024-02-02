import type { CodegenConfig } from "@graphql-codegen/cli";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { join, sep } from "path";

const schema = "https://mainnet.api.cartesiscan.io/graphql";

console.info(`Codegen will use schema URL: ${schema}`);

const basePath = join("src", "graphql");
const explorerSchema = "https://mainnet.api.cartesiscan.io/graphql";
const explorerAPIQueries = join(".", "graphql", "queries.graphql");
const rollupsSchema = join(".", "graphql", "rollups", "schema.graphql");
const rollupsDocuments = join(".", "graphql", "rollups", "queries.graphql");

interface CommonConfig extends Pick<Types.Config, "schema" | "documents"> {
    dirname: string;
}

type Generates = Partial<Pick<Types.Config, "generates">>;

const setup: CommonConfig[] = [
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
                    plugins: ["typescript-operations", "typescript-urql"],
                    presetConfig: {
                        typesPath: `.${sep}types`,
                    },
                    config: {
                        withHooks: false,
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
