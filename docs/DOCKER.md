## Docker image generation

In the project root folder run the following:

```shell
docker buildx bake
```

It will produce a `cartesi/rollups-explorer` tag `devel`.

By running the container with the exposed port `3000` it would be reachable in the browser by using `http://localhost:3000/explorer`.

The dockerfile used is [here](../docker/Dockerfile)

### Compose

There is a reference docker-compose that can be used if preferred [here](../docker/docker-compose.yaml)

Running the command from the project's root folder:

```shell
docker compose -f docker/docker-compose.yaml up
```

You can access on: `http://localhost:8080/explorer`
