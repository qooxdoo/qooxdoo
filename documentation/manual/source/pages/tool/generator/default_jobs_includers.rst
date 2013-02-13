.. _pages/tool/generator/generator_default_jobs#includer_jobs:

Default Includer Jobs
=======================

These jobs don't do anything sensible on their own, so it is no use to invoke them with the generator. But they can be used in the application's ``config.json``, to modify the behaviour of other jobs, as they pick up their definitions.

.. _pages/tool/generator/generator_default_jobs#cache:

cache
-----
Provides the :ref:`pages/tool/generator/generator_config_ref#cache` key with its
default settings.

.. _pages/tool/generator/generator_default_jobs#common:

common
------
Common includer job for many default jobs, mostly used internally. You should
usually not need to use it; if you do, use with care.


.. _pages/tool/generator/generator_default_jobs#includes:

includes
---------
Provides the :ref:`pages/tool/generator/generator_config_ref#include` key with its
default settings.

.. _pages/tool/generator/generator_default_jobs#libraries:

libraries
---------
This job should take a single key, :ref:`library
<pages/tool/generator/generator_config_ref#library>`.  The *libraries* job is
filled by default with your application and the qooxdoo framework library, plus
any additional libraries you specify in a custom *libraries* job you added to
your application's *config.json*. Here, you can add additional libraries and/or
contributions you want to use in your application. See the linked reference for
more information on the library key. Various other jobs will evaluate the
*libraries* job (like :ref:`pages/tool/generator/generator_default_jobs#api`,
:ref:`pages/tool/generator/generator_default_jobs#test`), to work on a common
set of libraries.

::

    "libraries" :
    {
      "library" : [ { "manifest" : "some/other/lib/Manifest.json" }]
    }

.. _pages/tool/generator/generator_default_jobs#profiling:

profiling
---------
Includer job, to activate profiling.

.. _pages/tool/generator/generator_default_jobs#log-parts:

log-parts
---------
Includer job, to activate verbose logging of part generation; use with the
``-v`` command line switch.

.. _pages/tool/generator/generator_default_jobs#log-dependencies:

log-dependencies
----------------
Includer job, to activate verbose logging of class dependencies; use with the
``-v`` command line switch.
