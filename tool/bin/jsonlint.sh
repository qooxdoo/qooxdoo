#!/bin/bash
##
# Just a tiny wrapper around demjson/jsonlint, to extend PYTHONPATH
##

QXPY="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/../pylib && pwd )"
PYTHONPATH=$QXPY:$PYTHONPATH python $QXPY/demjson/jsonlint -S -v $*
  # -S non-strict, e.g. allow comments
  # -v print to stdout (without it's only $?)
