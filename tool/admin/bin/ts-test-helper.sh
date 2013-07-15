#!/bin/bash
# name:
#  ts-test-helper.sh -- some bash functions to automate skeleton testing
#
# syntax:
#  bash> source $0
#  bash> create-apps <path/to/qx-sdk>  # will create some skeletons under '.'
#  bash> gen-source                    # will run 'source' job in suitable skeletons
#  ...                                 # other source and build jobs

function create-apps {
    for typ in `echo desktop inline native website server mobile`; do \
        ${1:?supply the path to the sdk}/create-application.py -t ${typ} -n ${typ/native/naive}; \
    done;
}

function gen-source {
    for app in `echo desktop inline naive server mobile`; do \
        ( cd ${app} && ./generate.py source & ); \
    done;
}

function gen-source-all {
    for app in `echo desktop inline naive mobile`; do \
        ( cd ${app} && ./generate.py source-all & ); \
    done;
}

function gen-source-hybrid {
    for app in `echo desktop inline naive mobile`; do \
        ( cd ${app} && ./generate.py source-hybrid & ); \
    done;
}

function gen-build {
    for app in `echo desktop inline naive website server mobile`; do \
        ( cd ${app} && ./generate.py build & ); \
    done;
}
