SERVER Skeleton - A qooxdoo Application Template
================================================

This is the qooxdoo 'server' application skeleton template. The
'create-application.py' script (usually under ${QOOXDOO_PATH}/tool/bin/) will
use this and expand it into a self-contained qooxdoo application which can then
be further extended. Please refer to the qooxdoo manual for further information.

If you are reading this in an already expanded application skeleton you can
safely overwrite it with contents suitable for your application.

Skeleton Usage
==============
This skeleton depends on a generated Server library, located under 
${QOOXDOO_PATH}/component/standalone/script/qx-oo.js. If this was not delivered
with your SDK, please change to this directory and invoke 'generate.py build'
(also for future 'server' skeletons), and copy the script to the current 
skeleton, in ./script. Alternatively, and only for the current skeleton, you can
create the qx-oo.js library locally, by running 'generate.py lib'.

The library will be used together with the application code, to make up the
final application. To make use of the qooxdoo tool chain, you need to generate
the application first, e.g. by running 'generate.py source'.  The generated
source file is saved under source/script/<custom>.js, the build file (with
'generate.py build') under build/script/<custom>.js. Those files can then be
executed, e.g. like:

# Node.js
$ node <custom>.js
or
# Rhino
$ java -cp js.jar org.mozilla.javascript.tools.shell.Main <custom>.js

This of course requires the presence of a Node or Rhino installation on your
system.


short:: for non-browser run times like Rhino, node.js
copy_file:: component/standalone/server/script/qx-oo.js    script/qx-oo.js
copy_file:: tool/data/generator/needs_generation_server.js  source/script/custom.js
