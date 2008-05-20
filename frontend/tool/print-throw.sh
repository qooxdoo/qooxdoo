#!/bin/bash
find framework/source/class/ -name "*.js" | grep -v "legacy" | xargs grep "throw" | cut -d":" -f1 | uniq
