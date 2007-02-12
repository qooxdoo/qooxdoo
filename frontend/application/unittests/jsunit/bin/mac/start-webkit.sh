#!/bin/sh

# Starts Webkit. Use this instead of calling the AppleScripts directly.

osascript bin/mac/stop-webkit.scpt
osascript bin/mac/start-webkit.scpt $1

