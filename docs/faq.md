# Frequently asked questions

### `--env` / `tags` isn't picked up

This might be because you're trying to specify `-e / --env` multiple times, but [multiple values should be comma-separated](https://docs.cypress.io/guides/guides/command-line#cypress-run-env-lt-env-gt).
