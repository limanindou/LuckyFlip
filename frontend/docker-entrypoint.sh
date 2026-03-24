#!/bin/sh
# Substitute ${BACKEND_URL} in the nginx template at container start.
# Only ${BACKEND_URL} is replaced; native nginx variables ($uri, $host, etc.)
# are left untouched because envsubst receives an explicit variable list.
export BACKEND_URL="${BACKEND_URL:-http://backend:8080}"
envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
