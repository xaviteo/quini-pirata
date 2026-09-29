#!/bin/sh
set -e
mkdir -p /app/data
chown -R next:next /app/data
exec su -s /bin/sh next -c "cd /app && node server.js"
