#!/bin/sh
set -e
mkdir -p /app/data
chown -R node:node /app/data
cd /app
exec runuser -u node -- node node_modules/next/dist/bin/next start -H 0.0.0.0 -p 3000
