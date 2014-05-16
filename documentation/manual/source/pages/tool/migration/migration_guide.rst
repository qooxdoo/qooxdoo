.. _pages/migration_guide#migration_guide:

Migration Guide
***************

Migrating from a previous qooxdoo version to a current release often requires
nothing more than just running the ``migration`` job in your application. Yet,
some changes between releases may involve manual modifications as detailed in
the migration guide of each `individual release
<http://qooxdoo.org/project/release_notes>`_. The following guide covers both
cases.

Backup
======

You might want to create a backup of your application files first. The
migration process changes source files in place, modifying your code base.

Configuration
==============

* Then, after you have unpacked the new qooxdoo SDK on your system, change
  references to it in your ``config.json`` and possibly in ``generate.py`` to
  point to the new version (look for "QOOXDOO_PATH"). Make sure that the path
  ends in the root directory of the SDK (like *".../qooxdoo-%{version}-sdk"*).

* Check the current `release notes
  <http://qooxdoo.org/project/release_notes/%{version}>`_ and those of
  `previous releases <http://qooxdoo.org/project/release_notes>`_ between your
  current version and %{version} for changes to the generator configuration, as
  they have to be done by hand. Make sure you  apply them to your config.json
  as far as they affect you. For example, with 0.8.1 the config.json macro
  ``QOOXDOO_PATH`` does not include the trailing "framework" part anymore, so
  make sure to add that in references to the qooxdoo class library. E.g. if you
  list the qooxdoo framework Manifest.json explicitly in your config using
  QOOXDOO_PATH, it should read *"${QOOXDOO_PATH}/framework/Manifest.json"*.

* Alternatively, particularly if you config.json is rather small, create a
  :ref:`separate gui skeleton
  <pages/getting_started/helloworld#create_your_application>` elsewhere and
  copy its config.json over to your application, and port the config settings
  from your old configuration to this file. This might be the simpler approach.

Run Migration
==============

Then change to your application's top-level directory and invoke the command
::

    generate.py migration

* Answer the interactive questions during its progress. For more information
  about this script, see the :ref:`corresponding job description
  <pages/tool/generator/generator_default_jobs#migration>`.

Migration Log
==============

* Check the ``migration.log`` which is created during the run of the migration
  script. Check all hints and deprecation warnings in the log and apply them to
  your code.

Release Notes
==============

* Apply all the instructions from the `"Migration" section
  <http://qooxdoo.org/project/release_notes/%{version}#migration>`_ of the
  release you are upgrading to, *and all intervening releases* between your old
  version and the target version, as far as they concern you.

Test
=====

You now have an up-to-date source tree in your application. Run
::

  generate.py source

to check that the generation process goes through and test your application in
the browser. Use the browser console or qooxdoo's own console to see any more
warnings and hints at runtime.

Special Issues
==============

Compiler Hints
---------------
Compiler hints of the ``#`` form are deprecated with qooxdoo 3.0. Use ``@``
hints in :doc:`JSDoc comments </pages/development/api_jsdoc_ref>` instead.
This affects all of ``#asset, #require, #use, #ignore`` and ``#cldr``. There
is mostly a one-to-one translation of the arguments, with unchanged semantics:

* ``#``\ asset\ *(<args>)* -> ``@``\ asset\ *(<args>)*
* ``#``\ require\ *(<args>)* -> ``@``\ require\ *(<args>)*
* ``#``\ use\ *(<args>)* -> ``@``\ use\ *(<args>)*
* ``#``\ ignore\ *(<args>)* -> ``@``\ ignore\ *(<args>)* The semantics of *@ignore* are
  slightly different from *#ignore* in that there is no *implicit* globbing on
  symbol names anymore, so that you might need to append a ``.*`` to a few
  of the arguments to achieve the same effect.
* ``#``\ cldr -> ``@``\ cldr\ *()* Mind that *@cldr* requires a pair of empty parentheses
  (to make the syntax consistent with other @-hints).

However, note that it's **not** just a change from ``#`` to ``@``. It's also a comment
type change (JS comments vs. JSDoc comments). Have a look at the examples:

**Example for #asset (qooxdoo < 3.0):**
::

  /* ************************************************

  #asset(myApp/*)

  ************************************************* */

  /**
   * This is ... of your custom application "myApp"
   */
  qx.Class.define("myApp.Application",
  {
    extend : qx.application.Standalone,
    ...

**Example for @asset (qooxdoo >= 3.0):**
::

  /**
   * This is ... of your custom application "myApp"
   *
   * @asset(myApp/*)
   */
  qx.Class.define("myApp.Application",
  {
    extend : qx.application.Standalone,
    ...


Legacy Versions
===============

If you are migrating from a legacy version of qooxdoo to %{version}, namely
from a **0.8.2** or prior release, please do a *two-step* migration to
%{version}. Firstly, migrate to `qooxdoo 0.8.3
<http://qooxdoo.org/project/release_notes/0.8.3>`_, following the instructions
in the `corresponding manual
<http://attic.qooxdoo.org/documentation/0.8#migration>`_. You will need a
qooxdoo 0.8.3 SDK to go through the process, so fetch one from the `download
location <https://sourceforge.net/projects/qooxdoo/files/>`_. This is necessary
as there have been major changes in qooxdoo which require the infrastructure of
the intermediate version to bridge. Then, follow the remaining steps in this
document.
