#!/bin/bash

PATHS="framework/source/class"

echo -n "  * Old style classes: "
find $PATHS -name "*.js" | xargs grep "qx.OO.defineClass(" | wc -l 

echo -n "  * New style classes: "
find $PATHS -name "*.js" | xargs grep "qx.Clazz.define(" | wc -l
