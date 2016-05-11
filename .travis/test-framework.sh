#!/bin/bash
set -ev

if [ "$QXBROWSER" = "" ]; then
    exit 0
fi

if [ "${QXBROWSER}" = "Firefox" ] && [ "${QXVERSION}" = "latest" ]; then
    npm run-script travis-coverage

    echo "Running lint..."
    ./generate.py -sI lint 2>&1 | grep 'Error:\|Warning:'
    if [ $? -eq 0 ]; then
        echo "Lint warnings are treated as errors! Please fix!"
        exit 1
    fi

else
    npm run-script travis-test
fi
