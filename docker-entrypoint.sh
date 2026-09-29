#!/bin/sh
set -e
mkdir -p /app/data
chown -R node:node /app/data
cd /app
exec runuser -u node -- node server.js
