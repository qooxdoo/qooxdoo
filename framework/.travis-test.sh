#!/bin/bash
set -ev

if [ "${QXBROWSER}" = "Firefox" ] && [ "${QXVERSION}" = "latest" ]; then
	npm run-script travis-coverage
else
	npm run-script travis-test
fi
