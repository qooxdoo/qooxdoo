Static Resources
===================

The files of resources.qooxdoo.org.

fonts/
  Fonts used by our website. (There used to be a copy of this folder in scss/,
  not sure why. Some .scss file seem to reference them?!)
images/
  Images, pictures, icons, the like.
javascript/
  JS files for the new (apr'12) web site, both static and those maintained in
  q.website/.
q.websites/
  Custom q build, some custom q plugins and application .js files that use them.
scss/
  .scss files to generate .css files from. They then go to stylesheets/.
stylesheets/
  CSS files, both static and those generated from .scss files.
style/
  Old static .css files, most probably still in use at attic.qooxdoo.org.
Makefile
  More for documentation, and not updated frequently. Authoritative jobs should
  be maintained in tool/admin/release/Makefile.release .


CSS Generation
---------------

Several files in stylesheets/ are generated. Currently, the way to generate all
of them from their scss/ sources is to go to the repo's root directory and issue

::

  make -f tool/admin/release/Makefile.release resources-build-css

Manual generation of each individual file is of course possible, e.g. with

::

  sass --watch -t expanded scss/base.scss:stylesheets/base.css (Sass compiler)

