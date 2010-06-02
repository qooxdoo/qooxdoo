.. _pages/migration_config#configuration_migration:

Configuration Migration
***********************

Most changes to qooxdoo's configuration system are additions, which are backwards compatible. This means older configuration files still work with newer versions of the generator; they just don't take advantage of the new features.

A few changes, though, affect existing keys. Since, as of today,  there is no automatic conversion of configuration files, adaptions to the new standard have to made by hand.

.. _pages/migration_config#compile-dist_/_compile-source:

compile-dist / compile-source
=============================

The ``compile-dist`` and ``compile-source`` keys have been superseded by :ref:`pages/tool/generator_config_ref#compile-options` and :ref:`pages/tool/generator_config_ref#compile`.  Here is how to migrate the old keys to the new.

.. _pages/migration_config#compile-dist:

compile-dist
------------

The ``compile-dist`` key can simply be renamed to ``compile-options``, together with an added ``compile`` key.

::

    "compile-dist" :          "compile-options" : 
    {                         {
      ...               =>      ...
    }                         }                              

    "compile" : { "type" : "build" }

.. _pages/migration_config#compile-source:

compile-source
--------------

Here is the mapping from the old ``compile-source`` keys to the new ``compile-options`` keys. The path-like expressions denote sub-keys.

::

    "compile-source" :          "compile-options" : 
    {                           {
      "file"                      "paths/file"          
      "root"                      "paths/app-root"
      "locales"         =>        "code/locales"
      "gzip"                      "paths/gzip"
      "decode-uris-plug"          "code/decode-uris-plug"
      "loader-template"           "paths/loader-template"
    }                           }                              

    "compile" : { "type" : "source" }

.. note::

    NOTE: If you are extending or overriding one of the standard build jobs, namely ``source-script`` or ``build-script``, you can leave out the ``compile`` key as this will be provided by the standard job.

