#!/usr/bin/env sh

set -e

specs=$(npx specs-by-tags "$@")

case $1 in
  "") exec npx cypress run --spec $specs ;;
  -*) exec npx cypress run --spec $specs "$@" ;;
   *) exec "$@" --spec $specs ;;
esac
