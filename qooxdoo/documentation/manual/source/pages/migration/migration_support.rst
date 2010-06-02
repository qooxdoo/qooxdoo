.. _pages/migration_support#migration_support:

Migration Support
*****************

Migrating from a previous qooxdoo version to a current release often requires nothing more than just running the ``migration`` job in your application. Of course, some changes between releases may involve manual modifications as detailed in the migration guide of each `individual release <http://qooxdoo.org/about/release_notes>`_.

For the moment lets assume all the migration steps can be handled automatically. In order to do so, you follow these steps:

* You might want to create a backup of your application files first. The migration process changes source files in place.
* Then, after you have unpacked the new qooxdoo SDK on your system, change references to the framework in your ``config.json`` and possibly in ``generate.py`` to point to the new version (look for ``QOOXDOO_PATH``).
* Then change to your application's top-level directory and invoke the command
  ::

    generate.py migration

* Follow the instructions of the migration script, particularly allow the cache to be deleted.

You now have up-to-date source files in your application. Run 
::

    generate.py source

to check that the generation progress goes through and test your application's run time behavior.
