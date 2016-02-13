#!/bin/sh
#
# Uses the Qooxdoo toolchain to analyse an application and retrieve the results of
#	generate.py into a JSON structure
#
#

if [ ! -f ./config.json -o ! -d source/script ] ; then
  echo inspect-qooxdoo must be run with current directory a Qooxdoo application
  exit
fi


NS=$(basename `pwd`)
TMPJS=${TMPDIR}/inspect-qooxdoo.js

./generate.py source
echo '
var window = {};
var qx = {};
var document = {
  createElement: function() {
    return {};
  }
};
var navigator = {};

' > $TMPJS
sed 's/^\s*qx.\$\$loader\.init();\s*$//' source/script/${NS}.js >>$TMPJS
echo '
console.log(JSON.stringify(
	{
		environment: qx.$$environment,
		libraries: qx.$$libraries,
		loader: qx.$$loader
	}, null, 2));
'>> $TMPJS
node $TMPJS > source/script/inspect-qooxdoo.json

