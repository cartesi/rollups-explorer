module.exports = {
    root: true,
    // This tells ESLint to load the config from the package `eslint-config-cartesi`
    extends: ["cartesi"],
    settings: {
        next: {
            rootDir: ["apps/*/"],
        },
    },
};
