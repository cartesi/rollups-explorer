import { config } from "eslint-config-cartesi/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [...config, { ignores: ["coverage/**", "test/**"] }];
