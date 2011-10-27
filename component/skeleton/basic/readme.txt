BASIC Skeleton - A qooxdoo Application Template
=============================================

This is a qooxdoo application skeleton which is used as a template. The 
'create-application.py' script (usually under tool/bin/create-application.py)
will use this and expand it into a self-contained qooxdoo application which 
can then be further extended. Please refer to the script and other documentation
for further information.

Usage
=====
The generated source file is located in the folder source/script/<custom>.js,
the build file in build/script/<custom>.js. Those two files can be executed:

node <custom>.js
or
java -cp js.jar org.mozilla.javascript.tools.shell.Main <custom>.js


short:: for non-browser run times like Rhino, node.js
