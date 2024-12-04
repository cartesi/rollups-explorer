target "docker-metadata-action" {}
target "docker-platforms" {}

# TODO: Remove temporary variable
variable "PREVIEW_API_URL" {
  default = "http://localhost:4350/graphql"
}

target "default" {
  inherits   = ["docker-metadata-action", "docker-platforms"]
  dockerfile = "docker/Dockerfile"
  context    = "."
  args = {
    "ENVIRONMENT" = "sunodo"
    # TODO: Remove temporary variable
    "PREVIEW_API_URL" = "${PREVIEW_API_URL}"
  }
}
