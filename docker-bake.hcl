target "docker-metadata-action" {}
target "docker-platforms" {}

target "default" {
  inherits   = ["docker-metadata-action", "docker-platforms"]
  dockerfile = "docker/Dockerfile"
  context    = "."

  args = {
    "ENVIRONMENT"   = "cartesi"
    "NODE_VERSION"  = "24.19.0-alpine3.23"
    "TURBO_VERSION" = "2.9.14"
    "PNPM_VERSION"  = "11.21.0"
  }
}
