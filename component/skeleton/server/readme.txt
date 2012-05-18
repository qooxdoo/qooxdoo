SERVER Skeleton - A qooxdoo Application Template
================================================

This skeleton application was created by running the 'create-application.py'
script. You usually will want to run

  ./generate.py

in this directory first thing. For more information about how to use this 
skeleton, please refer to the 'skeleton' section in the manual.

You can safely replace the entire contents of this file with your own 
documentation.


Skeleton Usage
==============
# Node.js
$ node <custom>.js
or
# Rhino
$ java -cp js.jar org.mozilla.javascript.tools.shell.Main <custom>.js

This of course requires the presence of a Node or Rhino installation on your
system.


# The following is only required during execution of 'create-application.py'
short:: for non-browser run times like Rhino, node.js
copy_file:: component/standalone/server/script/qx-oo.js     script/qx-oo.js
copy_file:: tool/data/generator/needs_generation_server.js  source/script/custom.js
