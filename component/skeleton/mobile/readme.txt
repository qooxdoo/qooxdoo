Mobile Skeleton - A qooxdoo Application Template
================================================

This is a qooxdoo application skeleton which is used as a template. The
'create-application.py' script (usually under tool/bin/create-application.py)
will use this and expand it into a self-contained qooxdoo application which
can then be further extended. Please refer to the script and other documentation
for further information.

short:: is a qooxdoo mobile application with full OO support and mobile GUI classes
copy_file:: tool/data/generator/needs_generation.js source/script/custom.js
copy_file:: framework/source/resource/qx/mobile/scss/theme/indigo/_styles.scss source/resource/custom/scss/_styles.scss
# indigo.css could be missing, if so
#    1) regenerate (requires Sass installed): 'generate.py compile-framework-scss'
#    2) remove app created just now
#    3) run 'create-application.py' again
# The warning should be gone.
copy_file:: framework/source/resource/qx/mobile/css/indigo.css source/resource/custom/css/custom.css
