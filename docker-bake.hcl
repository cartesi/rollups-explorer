target "docker-metadata-action" {}
target "docker-platforms" {}

target "default" {
  inherits   = ["docker-metadata-action", "docker-platforms"]
  dockerfile = "docker/Dockerfile"
  context    = "."
  args = {
    "ENVIRONMENT" = "sunodo"
  }
}
