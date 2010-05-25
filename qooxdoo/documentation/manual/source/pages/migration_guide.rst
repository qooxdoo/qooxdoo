.. _pages/migration_guide#migration_guide:

Migration Guide
***************

If you are migrating from a legacy verison of qooxdoo to 1.2, namely from a **0.7.x** release, please do a *two-step* migration to 1.2. Firstly, migrate to *[[:about:release_notes:0.8.3|qooxdoo 0.8.3]]*, following the instructions in the `corresponding manual <http://qooxdoo.org/documentation/0.8#migration>`_. You will need a qooxdoo 0.8.3 SDK to go through the process, so fetch one from the :doc:`download location <https///sourceforge.net/projects/qooxdoo/files/>`. This is necessary as there have been major changes in qooxdoo which require the infrastructure of the intermediate version to bridge. Then, follow the remaining steps in this document.

For those migrating from a **0.8.x** release of qooxdoo to 1.2, it may require little more than just running the ``migration`` job in your application, and then potentially applying further manual changes to your code. 

In order to do so, follow these steps:

  * **Backup**You might want to create a backup of your application files first. The migration process changes source files in place.
  * **Configuration(1)**Then, after you have unpacked the new qooxdoo SDK on your system, change references to the framework in your ``config.json`` and possibly in ``generate.py`` to point to the new version (look for "QOOXDOO_PATH").
  * **Configuration(2)**Check the current :ref:`release notes <about/release_notes/1.2#tooling>` and those of `previous releases <http://qooxdoo.org/about/release_notes>`_ between your current version and 1.2 for changes to the generator configuration, as they have to be made by hand. Make sure you  apply them to your config.json as far as they affect your particular config file. For example, with 0.8.1 the config.json macro ``QOOXDOO_PATH`` does not include the trailing "framework" part anymore, so make sure to add that. E.g. if you list the qooxdoo framework Manifest.json explicitly in your config using QOOXDOO_PATH, make sure "/framework" is appended after the macro reference.
  * If you have extended or overridden standard build jobs (``source-script`` or ``build-script``) in your config.json, follow these additional :doc:`migration hints <migration_config>`.
  * Alternatively, particularly if you config.json is rather small, create a :ref:`separate gui skeleton <pages/helloworld#create_your_application>` elsewhere and copy its config.json over to your application, and port the config settings from your old configuration to this file. This might be the simpler approach.
  * **Run Migration**Then change to your application's top-level directory and invoke the command
::

    generate.py migration

  * Follow the instructions of the migration script, particularly allow the cache to be deleted. For more information about this script, see the `corresponding section <http://qooxdoo.org/documentation/0.8/migration_guide_from_07#running_the_migration_script>`_ in the 0.8.x migration guide, but remember that information pertaining to 0.7.x may not apply to you. The general process of running the script is the same, though.
  * **Migration Log**Check the ``migration.log`` which is created during the run of the migration script. Check all hints and deprecation warnings in the log and apply them to your code.

You now have an up-to-date source tree in your application. Run 
::

    generate.py source
 to check that the generation process goes through and test your application's run time behaviour.

