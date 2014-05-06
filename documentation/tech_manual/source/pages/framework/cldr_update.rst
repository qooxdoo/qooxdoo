Updating CLDR data
******************

1.  Download the `latest archive (core.zip) <http://cldr.unicode.org/index/downloads>`__
2.  Check the release notes for changes to the XML structure
3.  In the qooxdoo repo, Delete /tool/data/cldr/main/*
4.  Copy the files from the unpacked core.zip (unicode-license.txt and common/main)
5.  Use git diff to verify the changes/additions
6.  Build and test Showcase and Playground (after distclean)
7.  Update version number in /tool/data/cldr/readme.txt