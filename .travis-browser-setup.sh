#!/bin/bash

if [ $QXBROWSER = Firefox ]; then
    wget -O /tmp/firefox.tar.bz2 "https://download.mozilla.org/?product=firefox-${QXVERSION}&lang=en-US&os=linux64"
    tar xf /tmp/firefox.tar.bz2
else
    wget -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-${QXVERSION}_current_amd64.deb
    dpkg --extract /tmp/chrome.deb chrome-x
    if [ $QXVERSION = stable ]; then
        mv chrome-x/opt/google/chrome chrome
        mv chrome/google-chrome chrome/google-chrome-stable
    else
        mv chrome-x/opt/google/chrome-$QXVERSION chrome
        rm chrome/google-chrome
    fi
    ln -s google-chrome-$QXVERSION chrome/google-chrome
fi
