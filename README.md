# Rollups Explorer

This is a monorepo holding up two web applications. One is called [web](./apps//web/) and is the UI for the rollups explorer and the second is called [workshop](./apps/workshop/) that is a storybook to support fast development iteration and showcase. The repository also holds a few packages more on these below.

## What's inside?

This monorepo uses [Yarn v1](https://classic.yarnpkg.com/) as a package manager and is controlled by [turborepo](https://turbo.build/repo).

## Formatter + Linter

In case you are not using [vscode](https://code.visualstudio.com/), make sure you are configuring your IDE of choice to follow the rules set on the repository, so the development is coherent avoiding noise on pull requests and CI breaking because the formatter and linter checks failed.

> [!NOTE]
> Have a look inside the [.vscode/settings.json](./.vscode/settings.json) and make sure the default formatter matches and the `editor.codeActionsOnSave` equivalent configuration is applied. The rule of thumb is to develop from the project's root folder.

## Package Installation

You can add, remove and upgrade packages from within your monorepo using your package manager's built-in commands:

`yarn workspace <workspace> add <package>`

> Refer to Turborepo [package-installation](https://turbo.build/repo/docs/handbook/package-installation) session for more information.

## Apps and Packages

- `apps/web`: The Rollups explorer powered by [Next.js](https://nextjs.org/) framework.
- `apps/workshop`: The Storybook App using Vite with HMR and some ESLint rules.
- `packages/ui`: House components driven by Rollups domain.
- `packages/rollups-wagmi`: Using wagmi-cli + plugins code generate assets to support interaction with blockchain.
- `packages/eslint-config-cartesi`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `packages/tsconfig`: A few `tsconfig.json`s that is used throughout the monorepo.

## Development

To start developing on all apps and packages, run the following command:

```
yarn run dev
```

> [!NOTE]
> When running turborepo tasks like `dev` or `build` it will run apps like web and workshop in parallel. e.g. when you want only to do `dev` on the web app, you should apply filtering to the task.

The filtering should be done by the **name** inside the package.json of the targeted `apps/*`

```
yarn run dev --filter=web --filter=@cartesi/rollups-explorer-ui
```

## Testing

We are using [Vitest framework](https://vitest.dev/) combined with [testing-library](https://testing-library.com/docs/react-testing-library/intro/) for react in both `packages/ui` and `apps/web`.

## Build

To build all apps, run the following command:

```
yarn run build
```

> [!NOTE]  
> If developing inside the e.g. `apps/web` make sure the assets it depends upon are built. Rule of thumb is always develop from the root project for a multitute of reasons (e.g. formatting and linting rules been correctly applied)

## Release

The project use **tags** that represent releases and currently if it hits the `main` branch it will be live.

The tag format is as follows:

- Combined tag name `v` + SemVer format **tag** (e.g. v0.3.0) to pinpoint repository state on a given production release.

## Turborepo Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
