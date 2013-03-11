What's in here
**************

* fonts/
  Fonts used by our website. (There used to be a copy of this folder in scss/,
  not sure why. Some .scss file seem to reference them?!)
* images/
  Images, pictures, icons, the like.
* javascript/
  The scripts for the new (apr'12) web site.
* scss/
  .scss files to generate .css files from. They then go to stylesheets/.
* stylesheets/
  CSS files, both static (sh*.css) and those generated from .scss files.
* style/
  Old static .css files, most probably still in use at attic.qooxdoo.org.
* Makefile
  More for documentation, and not updated frequently. Authoritative jobs should
  be maintained in tool/admin/release/Makefile.release .


CSS Generation
***************

The files in css/ are generated. Currently, the way to generate all of them
from their scss/ sources is to go to the repo's root directory and issue

  make -f tool/admin/release/Makefile.release resources-build

Manual generation of each individual file is of course possible, e.g. with

  scss -t expanded scss/base.scss css/base.css (Ruby-Sass)
  scss.py -C scss/base.scss -o css/base.css    (pyScss)

