target "docker-metadata-action" {}
target "docker-platforms" {}

target "default" {
  inherits   = ["docker-metadata-action", "docker-platforms"]
  dockerfile = "docker/Dockerfile"
  context    = "."
  args = {
    "ENVIRONMENT" = "cartesi"
    "NODE_VERSION"= "22.22-alpine3.23"
    "TURBO_VERSION"= "2.8.11"
    "PNPM_VERSION"= "10.25.0"
  }
}
