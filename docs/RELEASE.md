# Release

The project uses **tags** that represent releases and currently if it hits the `main` branch it will be deployed on a cloud provider.

The tag format is as follows:

- Combined tag name `v` + SemVer format **tag** (e.g. v1.0.0, v2.0.0-alpha.1) to pinpoint repository state on a given production release.

Given a tag is published a docker image of [rollups-explorer](../apps/explorer/) application will be built and published on both [ghcr.io](https://github.com/cartesi/rollups-explorer/pkgs/container/rollups-explorer) and [dockerhub](https://hub.docker.com/r/cartesi/rollups-explorer/tags). The GitHub action can be checked [here](../.github/workflows/docker.yaml)
