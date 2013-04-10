resources.qooxdoo.org
**********************

Static assets like style sheets, scripts and images that are not controlled by
one of our subsystems (like the blog software) are served from
**resources.qooxdoo.org**. It also holds snapshots of our software or dedicated
downloads like patches.

CSS and JS files are maintained in our Git repository (see further). Those asset
files are not only used on our web sites, but also in manual.

CSS
====

**/style**
  Old style sheets, still in use for http://attic.qooxdoo.org.

**/stylesheets**
  Style sheets for the new homepage (apr'12).

Maintenance
------------

These style sheets are maintained in our repository.

**tool/admin/www/resources/stylesheets**
  Directory with CSS files as used online. This directory and its contents is
  copied to the production server. Files in this directory are under version
  control (although some of them are generated).
**tool/admin/www/resources/scss**
  Path to the .scss sources for (some of the) .css files in ``stylesheets/``.
**make -f tool/admin/release/Makefile.release resources-build-css**
  Make command to run the SCSS compiler and re-generate the CSS files in
  ``stylesheets/`` that are maintained as .scss files. This command is
  automatically run with a ``publish-build``.
**make -f tool/admin/release/Makefile.release resources-publish**
  Make command to publish resources (all, not just CSS) to the staging server.
  Run by ``publish-build``.


JavaScript
============

**/javascripts**
  Script files for the new homepage (apr'12).

Maintenance
-------------

Script files used on our web sites are maintained in the repository.

**tool/admin/www/resources/javascripts**
  Directory with JS files as used online. This directory and its contens is
  copied to the production server. Files in this directory are under version
  control (although some of them are copies from other paths).

  The directory contains third-party scripts that should be updated in place,
  keeping license files in sync.
**tool/admin/www/resources/q.website**
  Self-written script code is maintained here. It contains a
  ``qx.Website``-style skeleton structure.

  * **script**
    Contains a custom q library, where the range of framework classes is
    taylored towards what's needed on the web sites. Needs to be generated, with
    jobs ``q-build`` and ``q-build-min``. The q-build-min output is what gets
    used in ``javascripts/q.js``.
  * **source**
    Contains custom application files and q plugins, to be maintained here.
  * **test**
    Standard testrunner-portable environment, with adapted ``index.html``, so a
    dedicated ``script/q-<version>.min.js`` q library is loaded for the
    testrunner itself.
  * **index.html**
    Custom index.html to develop all the components, uses all scripts and styles
    also used online.

**make -f tool/admin/release/Makefile.release resources-build-js**
  Make command to run the Generator, re-generate the q library, and copy it and
  all the .js files in ``source/`` to ``javascripts``. This command is *not*
  automatically run with a ``publish-build``, and has to be invoked directly.
**make -f tool/admin/release/Makefile.release resources-publish**
  Make command to publish resources (all, not just JS) to the staging server.
  Run by ``publish-build``.
