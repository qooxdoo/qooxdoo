Default Includer Jobs
=====================

These jobs don't do anything sensible on their own, so it is no use to invoke them with the generator. But they can be used in the application's `config.json`, to modify the behaviour of other jobs, as they pick up their definitions.

cache
-----

Provides the pages/tool/generator/generator\_config\_ref\#cache key with its default settings.

common
------

Common includer job for many default jobs, mostly used internally. You should usually not need to use it; if you do, use with care.

includes
--------

Provides the pages/tool/generator/generator\_config\_ref\#include key with its default settings.

libraries
---------

This job should take a single key, library
\<pages/tool/generator/generator\_config\_ref\#library\>. The *libraries* job is filled by default with your application and the qooxdoo framework library, plus any additional libraries you specify in a custom *libraries* job you added to your application's *config.json*. Here, you can add additional libraries and/or contributions you want to use in your application. See the linked reference for more information on the library key. Various other jobs will evaluate the *libraries* job (like pages/tool/generator/generator\_default\_jobs\#api, pages/tool/generator/generator\_default\_jobs\#test), to work on a common set of libraries.

    "libraries" :
    {
      "library" : [ { "manifest" : "some/other/lib/Manifest.json" }]
    }

profiling
---------

Includer job, to activate profiling.

log-parts
---------

Includer job, to activate verbose logging of part generation; use with the `-v` command line switch.

log-dependencies
----------------

Includer job, to activate verbose logging of class dependencies; use with the `-v` command line switch.
