.. _pages/tool/generator#generator_overview:

Generator Overview
******************

This is a high-level overview of some important generator features.

Quick links:

* :doc:`generator_usage`
* :doc:`Configuration file details <generator_config>`

.. _pages/tool/generator#configuration:

Configuration
=============

* Load project configuration from JSON data file
* Each configuration can define multiple so named jobs
* Each job defines one action with all configuration
* A job can extend any other job and finetune the configuration
* Each execution of the generator can execute multiple of these jobs

.. _pages/tool/generator#cache_support:

Cache Support
=============

* Advanced caching system which dramatically reduces the runtime in repeated calls.
* The cache stores data on the disk using the ``pickle`` Python module.
* Invalidation of cache files happens through a comparison of modification dates.
* Cache filenames use hash keys to keep them short and unique.
* Among the information which is being cached by the generator there are

  * class meta data
  * syntax trees
  * code dependencies
  * compiler results
  * api data
  * localization data

.. _pages/tool/generator#class_selection:

Class Selection
===============

* Use include/exclude lists to define the set of classes to use.
* Allows simple wildcards, e.g. ``qx.*``.
* By default, prerequisite classes are added to the class set, except those specified by an exclude.
* This can be toggled using a ``=`` prefix. This switches to a mode where exactly the classes listed in the config are included.
* As a fallback all known classes will be added when no includes are defined.

.. _pages/tool/generator#variants:

Variants
========

* From a single code base multiple variants can be created.
* This is controlled by *environment* variables, the values of which can be queried in the code.
* Given a set of environment bindings, code parts that are never executed as a consequence, can be pruned from the final application, saving code size.
* It is possible to generate multiple variant combinations. This means that a single job execution can create multiple files at once using different sets of environment bindings ("variant sets"). 
* Variants are combinable and all possible combinations are automatically created. For example: gecko+debug, mshtml+debug, gecko+nodebug, mshtml+nodebug.

.. _pages/tool/generator#api_data:

API Data
========

* Creation of split API data which loads incrementally as needed.
* Creation of a searchable index containing all relevant names of the API (e.g. classes, properties, functions, events, ...)

.. _pages/tool/generator#internationalisation:

Internationalisation
====================

* Creation and update of "po" files based on marked strings in the class files.
* Inclusion of translation information in the generated application.
* Dynamic creation of localization data based on the standardized informations available at unicode.org. The "main" package of CLDR which is used, is locally mirrored in the SDK.

.. _pages/tool/generator#parts:

Parts
=====

* Each part can be seen as a logical or visual component of the application.
* Each part may result in multiple packages (script output files).
* The number of packages could be exponential to the number of parts (but through the optimization this is often not the case).
* Packages are merged given some constraints (e.g. minimal size), to reduce their overall number.
* The parts are defined in the application configuration, using a similar include key like the class selection.
* There is one signified initial part, named 'boot', that is loaded automatically at application startup, and contains the initial set of functionality.
* Other parts are loaded explicitly by the application code, using a specific ``PartLoader`` API of the framework.

