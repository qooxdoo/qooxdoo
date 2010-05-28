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

* Advanced multi-level caching system which dramatically reduces the runtime in repeated calls.
* The cache stores all data on the disk using the ``cpickle`` Python module.
* Invalidation of cache files happens through a comparision of modification dates.
* Cache filenames are generated through SHA1 (hex) to keep them short and unique.
* There is memory-only caching as well. It is used for dependencies and meta data.
* The system supports caching for:

  * extracted meta data
  * syntax tokens
  * syntax trees
  * class dependencies
  * compiler results
  * api data
  * localizable strings

.. _pages/tool/generator#class_selection:

Class Selection
===============

* Use include/exclude lists to define the classes to use.
* Has support for simple expressions inside each include or exclude definition e.g. ``qx.*``.
* The smart mode (default) includes/excludes the defined classes and their dependencies. This mode also excludes all classes only required by the excluded classes.
* The other mode is toggled using a ``=`` prefix. This switches to a mode where exactly the classes mentioned are included/excluded.
* As a fallback all known classes will be added when no includes are defined.

.. _pages/tool/generator#variants:

Variants
========

* It is possible to generate multiple variant combinations. This means that a single job execution can create multiple files at once using different so-named variant sets. Variants are combinable and all possible combinations are automatically created. For example: gecko+debug, mshtml+debug, gecko+nodebug, mshtml+nodebug
* The system supports placeholders in the filename to create filenames based on variant selection [TBD].

.. _pages/tool/generator#api_data:

API Data
========

* Creation of split API data which loads incrementally as needed.
* Creation of API index containing all relevant names of the API (e.g. classes, properties, functions, events, ...)

.. _pages/tool/generator#internationalisation:

Internationalisation
====================

* Creation and update of "po" files based on the classes of any namespace.
* Generation of JavaScript data to be included into application
* Dynamic creation of localization data based on the standardized informations available at unicode.org. The "main" package of CLDR which is used, is locally mirrored in the SDK.

.. _pages/tool/generator#parts:

Parts
=====

* Each part can be seen as a logical or visual group of the application.
* Each part may result into multiple packages (script output files).
* The number of packages could be exponential to the number of parts (but through the optimization this is often not the case).
* It is possible to automatically collapse any number parts (e.g. merging the packages used by a part). Such an important part may be the one which contains the initial application class (application layout frame) or the splashscreen. Collapsing reduces the number of packages (script files) for the defined parts. However collapsing badly influences the fine-grained nature of the package system and should be ommitted for non-initial parts normally.
* Further optimization includes support for auto-merging small packages. The relevant size to decide if a package is too small, is the minimum compiled size which is defined by the author of the job. The system calculates the size of each package and tries to merge packages automatically.
* The parts can be used in combination with the include/exclude system. Includes can be used to select the classes to use.
* By default all classes mentioned in the parts are added to the include list. It is possible to override this list.
* All global excludes listed are also respected for the parts. 

