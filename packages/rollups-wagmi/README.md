### Rollup Wagmi Package

This package is responsible to generate all cartesi rollups information and function that works with Wagmi.

The generation happens when the npm-script `codegen` is executed (most of the time called by turborepo tasks).

> [!IMPORTANT]  
> In case the rollups-v2 library version shall be bumped, also upgrade the `cannon:inspect` npm-script accordingly to the matching version and execute it once to update the contents inside the `/deployments` folder.
