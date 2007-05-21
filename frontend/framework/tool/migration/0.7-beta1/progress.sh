#!/bin/bash

cd  `dirname $0`
PATHS="../../../source/class"

echo -n "  * Old style classes: "
FILES_OLD=`find $PATHS -name "*.js" -exec grep -lE "qx\.OO\.defineClass\s*\(" {} \; | sed 's/^.*$/&\\\n/g' | head -n -1 - `
echo -en ${FILES_OLD} | wc -l

echo -n "  * New style classes: "
FILES_NEW=`find $PATHS -name "*.js" -exec grep -lE "qx\.Clazz\.define\s*\(" {} \; | sed 's/^.*$/&\\\n/g' | head -n -1 - `
echo -en ${FILES_NEW} | wc -l

echo -e "\n--------------------------------------------------------------------------------"
echo -e "  Potential errors in new-style classes:"
echo -e "--------------------------------------------------------------------------------\n"

FILES_NEW_LIST=`echo -e ${FILES_NEW} | grep -Ev 'qx\/OO\.js|qx\/Clazz\.js' | sed 's/&\\\n/ /g'`
for i in ${FILES_NEW_LIST}; do \
  grep -EH "qx\.OO\.|qx\.Class\b|qx\.Proto\b|qx\.Super\b" $i ;
done




