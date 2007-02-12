#!/bin/sh

# Starts Opera. Use this instead of calling the AppleScripts directly.

osascript bin/mac/stop-opera.scpt
osascript bin/mac/start-opera.scpt $1

