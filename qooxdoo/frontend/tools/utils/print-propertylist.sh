#!/usr/bin/env bash

cd `dirname $0`/../..

(
for word in `find source/script/ -name "*.js" | xargs grep -Esh "\.addProperty\({.*}\);" | cut -d"{" -f2 | cut -d"," -f1 | cut -d"\"" -f2 | sort | uniq | grep -v ":"`;
do
  u=`echo $word | awk '{ print toupper(substr($1, 1, 1)) substr($1, 2) }'`

  echo "set$u"
  echo "get$u"
done

for word in `find source/script/ -name "*.js" | xargs grep -Esh "\.addPropertyGroup\({.*}\);" | cut -d"{" -f2 | cut -d"," -f1 | cut -d"\"" -f2 | sort | uniq | grep -v ":"`;
do
  u=`echo $word | awk '{ print toupper(substr($1, 1, 1)) substr($1, 2) }'`

  echo "set$u"
  echo "get$u"
done
) | sort
