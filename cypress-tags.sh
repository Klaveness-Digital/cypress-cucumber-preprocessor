#!/usr/bin/env sh

set -e

specs=$(npx specs-by-tags "$@")

if [ -z "$specs" ]; then
  case $1 in
    "") exec npx cypress run ;;
    -*) exec npx cypress run "$@" ;;
    *) exec "$@" ;;
  esac
else
  case $1 in
    "") exec npx cypress run --spec $specs ;;
    -*) exec npx cypress run --spec $specs "$@" ;;
    *) exec "$@" --spec $specs ;;
  esac
fi
