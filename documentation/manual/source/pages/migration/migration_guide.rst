.. _pages/migration_guide#migration_guide:

Migration Guide
***************

Migrating from a previous qooxdoo version to a current release often requires nothing more than just running the ``migration`` job in your application. Yet, some changes between releases may involve manual modifications as detailed in the migration guide of each `individual release <http://qooxdoo.org/project/release_notes>`_. The following guide cover both cases.

If you are migrating from a legacy verison of qooxdoo to %{version}, namely from a **0.8.2** or prior release, please do a *two-step* migration to %{version}. Firstly, migrate to `qooxdoo 0.8.3 <http://qooxdoo.org/project/release_notes/0.8.3>`_, following the instructions in the `corresponding manual <http://attic.qooxdoo.org/documentation/0.8#migration>`_. You will need a qooxdoo 0.8.3 SDK to go through the process, so fetch one from the `download location <https://sourceforge.net/projects/qooxdoo/files/>`_. This is necessary as there have been major changes in qooxdoo which require the infrastructure of the intermediate version to bridge. Then, follow the remaining steps in this document.

* **Backup**

  You might want to create a backup of your application files first. The migration process changes source files in place, modifying your code base.

* **Configuration**

  * Then, after you have unpacked the new qooxdoo SDK on your system, change references to it in your ``config.json`` and possibly in ``generate.py`` to point to the new version (look for "QOOXDOO_PATH"). Make sure that the path ends in the root directory of the SDK (like *.../qooxdoo-%{version}-sdk*).

  * Check the current `release notes <http://qooxdoo.org/project/release_notes/%{version}#tooling>`_ and those of `previous releases <http://qooxdoo.org/project/release_notes>`_ between your current version and %{version} for changes to the generator configuration, as they have to be done by hand. Make sure you  apply them to your config.json as far as they affect you. For example, with 0.8.1 the config.json macro ``QOOXDOO_PATH`` does not include the trailing "framework" part anymore, so make sure to add that in references to the qooxdoo class library. E.g. if you list the qooxdoo framework Manifest.json explicitly in your config using QOOXDOO_PATH, it should read *${QOOXDOO_PATH}/framework/Manifest.json*.
  
  * Alternatively, particularly if you config.json is rather small, create a :ref:`separate gui skeleton <pages/getting_started/helloworld#create_your_application>` elsewhere and copy its config.json over to your application, and port the config settings from your old configuration to this file. This might be the simpler approach.

* **Run Migration**

  Then change to your application's top-level directory and invoke the command
  ::

    generate.py migration

* Follow the instructions of the migration script, particularly allow the cache to be deleted. For more information about this script, see the :ref:`corresponding job description <pages/tool/generator_default_jobs#migration>`.

* **Migration Log**
  
  Check the ``migration.log`` which is created during the run of the migration script. Check all hints and deprecation warnings in the log and apply them to your code.

* **Test**

  You now have an up-to-date source tree in your application. Run 
  ::

    generate.py source

  to check that the generation process goes through and test your application in the browser.

