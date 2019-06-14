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

After running generate.py you can invoke the generated script like this:

# Node.js
$ node source/script/<custom>.js

  or

# Rhino
$ cd source/script && java -cp <path_to_rhino>/js.jar org.mozilla.javascript.tools.shell.Main <custom>.js

This of course requires the presence of a Node or Rhino installation on your
system. The build version of the application is analogously written to build/script.


# The following is only required during execution of 'create-application.py'
short:: for non-browser run times like Rhino, node.js
copy_file:: component/standalone/server/script/qx-oo.min.js     script/qx-oo-6.0.0-beta.min.js
copy_file:: tool/data/generator/needs_generation_server.js  source/script/custom.js
