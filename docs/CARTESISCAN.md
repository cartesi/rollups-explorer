# CartesiScan

A Next.js app called [web](../apps/web/) that is the CartesiScan UI. The [workshop](../apps/workshop/) is a storybook application to support showcase and quick development of components. The backend for the CartesiScan can be found [here](https://github.com/cartesi/rollups-explorer-api)

> [!NOTE]
> CartesiScan will be phased out in the future.

## Apps and Packages

- `apps/web`: The Rollups explorer powered by [Next.js](https://nextjs.org/) framework.
- `apps/workshop`: The Storybook App using Vite with HMR and some ESLint rules.
- `packages/ui`: House components driven by Rollups domain.
- `packages/rollups-wagmi`: Using wagmi-cli + plugins code generate assets to support interaction with blockchain.
- `packages/eslint-config-cartesi`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `packages/tsconfig`: A few `tsconfig.json`s that is used throughout the monorepo.

## Development

To start developing on all apps and packages, run the following command:

```shell
pnpm dev
```

> [!NOTE]
> When running turborepo tasks like `dev` or `build` it will run apps like web and workshop in parallel. e.g. when you want only to do `dev` on the web app, you should apply filtering to the task.

The filtering should be done by the **name** inside the package.json of the targeted `apps/*`

```shell
pnpm dev --filter=web --filter=@cartesi/rollups-explorer-ui
```

## Testing

The project is using [Vitest framework](https://vitest.dev/) combined with [testing-library](https://testing-library.com/docs/react-testing-library/intro/) for react in both `packages/ui` and `apps/web` for unit testing.

### E2E Testing

The project is using [Playwright](https://playwright.dev/docs/intro) to run the E2E checks against the rollups-explorer UI. You can run the commands inside the [web](../apps/web/) app.

> [!IMPORTANT]  
> Make sure you have your app running in dev mode or a built version

For single run, execute the following:

```shell
pnpm test:e2e
```

To run in an interactive way with watch mode run the following command (Preferred)

```shell
pnpm run test:e2e:ui
```

Below is a table with env vars and its default value that is used by the Playwright config, that can be found inside the `apps/web`

|  Env variable  |         Default         |
| :------------: | :---------------------: |
| `E2E_BASE_URL` | `http://localhost:3000` |
|      `CI`      |       `undefined`       |

## Build

To build all apps, run the following command:

```shell
pnpm run build
```

> [!NOTE]  
> If developing inside the e.g. `apps/web` make sure the assets it depends upon are built. Rule of thumb is always develop from the root project for a multitude of reasons (e.g. formatting and linting rules being correctly applied)
