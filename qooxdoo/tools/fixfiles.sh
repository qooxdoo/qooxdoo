#!/bin/bash

cd `dirname $0`/.. 
chmod 775 tools/*.sh
tools/dos2unix.sh
chmod 775 tools/*.sh
chmod 664 tools/*.py tools/*.xsl
chmod 755 tools/script tools/style
