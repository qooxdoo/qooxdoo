.. _pages/tool/generator/generator_config_ref#reference_listing_of_config_keys:

Generator Config Keys
********************************

This page contains the complete list of configuration keys and their sub-structures.

Mandatory keys in a context are marked *'(required)'*, all other keys can be considered optional (most have default values). Special note boxes starting with *'peer-keys'* indicate interactions of the current key with other  configuration keys that should be present in the job for the current key to function properly. E.g. the key :ref:`pages/tool/generator/generator_config_ref#compile` will use the peer-key :ref:`pages/tool/generator/generator_config_ref#cache` in the job definition for its workings. Again, in many cases fall-back defaults will be in place, but relying on them might lead to sub-optimal results.

.. _pages/tool/generator/generator_config_ref#add-css:

add-css
==========

Add CSS files to the application. Takes a list.

::

  "add-css" :
  [
    {
      "uri" : "<css-uri>"
    }
  ]

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#compile`

* **uri** *(required)* : URI with which the css file will be loaded, relative to the index.html.

.. _pages/tool/generator/generator_config_ref#add-script:

add-script
==========

Add pre-fabricated JS files to the application. Takes a list.

::

  "add-script" :
  [
    {
      "uri" : "<script-uri>"
    }
  ]

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#compile`

* **uri** *(required)* : URI with which the script will be loaded, relative to the index.html.

.. _pages/tool/generator/generator_config_ref#api:

api
===

Triggers the generation of a custom Apiviewer application. Takes a map.

::

  "api" :
  {
    "path"   : "<path>",
    "verify" : [ "links", "types", "statistics" ],
    "warnings" :
    {
      "output" : [ "data", "console" ]
    }
    "sitemap" :
    {
      "link-uri" : "<uri>",
      "file" : "<path>"
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#include`, :ref:`pages/tool/generator/generator_config_ref#library`

* **path** *(required)* : Path where the Apiviewer application is to be stored, relative to the current directory.
* **verify** : Additional checks to run during API data generation.

  * **links** : Check internal documentation links (@link{...}) for consistency.
  * **types** : Check if documented parameter and return value types are known classes, valid global objects or built-in types
  * **statistics** : Show a summary of total API items, items with missing or incomplete documentation and the documentation completeness percentage

* **warnings** : Controls the output of warning messages for API doc errors and omissions.

  * **data** : Store warning messages in the generated API data (warnings will be displayed in the API Viewer).
  * **console** : Write warning messages to the shell.

* **sitemap** : Create an XML sitemap with links for all classes in the API Viewer.

  * **link-uri** : URI template for the sitemap entries. `%s` will be replaced with the class name.
  * **file** : File path for the sitemap. Default: `<api/path>/sitemap.xml`

.. _pages/tool/generator/generator_config_ref#asset-let:

asset-let
=========

Defines macros that will be replaced in :ref:`pages/development/api_jsdoc_ref#asset` hints. Takes a map.

::

  "asset-let" :
  {
    "<macro_name>" : [ "foo", "bar", "baz" ]
  }

Each entry is

* <macro_name> : [<list of replacement strings>] Like with macros, references
  (through '${macro_name}') to these keys in @asset hints in source files will be
  replaced. Unlike macros, each listed value will be used, and the result is the
  list of all ensuing expressions, so that all resulting assets will be honored.

:ref:`Special section <pages/tool/generator/generator_config_articles#asset-let_key>`

.. _pages/tool/generator/generator_config_ref#cache:

cache
=====

Define the paths to cache directories, particularly to the compile cache. Takes a map.

::

  "cache" :
  {
    "compile"     : "<path>",
    "downloads"   : "<path>",
    "invalidate-on-tool-change" : (true|false)
  }

Possible keys are

* **compile** : path to the "main" cache, the directory where compile results are cached, relative to the current (default:  ":doc:`${CACHE} <generator_config_macros>`")
* **downloads** : directory where to put downloads, relative to the current (default: ":doc:`${CACHE} <generator_config_macros>`/downloads")
* **invalidate-on-tool-change** : when true, the *compile* cache (but not the downloads) will be cleared whenever the tool chain is newer (relevant mainly for trunk users; default: *true*)

:ref:`Special section <pages/tool/generator/generator_config_articles#cache_key>`

.. _pages/tool/generator/generator_config_ref#clean-files:

clean-files
===========

Triggers clean-up of files and directories within a project and the framework, e.g. deletion of generated files, cache contents, etc. Takes a map.

::

  "clean-files" :
  {
    "<doc_string>" :
    [
      "<path>",
      "<path>"
    ]
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

Each key is a doc string that will be used in logging when deleting the corresponding files.

* <doc_string> : arbitrary string
* <path>       : file/path to be deleted; may be relative to config file location; :ref:`file globs <pages/tool/generator/generator_config_articles#file_globs>` allowed

.. _pages/tool/generator/generator_config_ref#collect-environment-info:

collect-environment-info
========================

Triggers the collection of information about the qooxdoo environment, and prints it to the console. Takes a map.

::

  "collect-environment-info" : {}

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

This key currently takes no subkeys, but you still have to provide an empty map. The information collected includes the qooxdoo version, the Python version, the path to the cache, stats about the cache contents, whether the current application has been built, asf.


.. _pages/tool/generator/generator_config_ref#combine-images:

combine-images
==============

Triggers the creation of combined image files that contain various other images. Takes a map.

::

  "combine-images" :
  {
    "montage-cmd" : "<string_template>",
    "images" :
    {
      "<output_image>" :
      {
        "prefix": [ "<string>", "<altstring>" ],
        "layout": ("horizontal"|"vertical"),
        "input" :
        [
          {
            "prefix" : [ "<string>", "<altstring>" ],
            "files"  : [ "<path>", "<path>" ]
          }
        ]
      }
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

.. note::

  Unless you are generating a base64 combined image, this key requires an external program (ImageMagic) to run successfully.

* **montage-cmd** *(experimental)*: command line for the ImageMagick `montage` command. If you create a binary combined image (e.g. .png, .gif), the *montage* command line utility will be invoked. This command template will be used to invoke it, and is exposed here so you can adjust it to your local ImageMagick installation. If you tweak this template and shuffle things around, make sure the placeholders ``%(<name>)s`` remain intact. Example values are:

  * ``"montage @%(tempfile)s -geometry +0+0 -gravity NorthWest -tile %(orientation)s -background None %(combinedfile)s"`` *(for ImageMagick v6.x)*
  * ``"montage -geometry +0+0 -gravity NorthWest -tile %(orientation)s -background None @%(tempfile)s %(combinedfile)s``" *(for ImageMagick v5.x)*

  (default: *""*)

* **images** : map with combine entries

  * **<output_image>** : path of output file; may be relative to the config file location; the file ending determines the file format; use *.png*, *.gif*, etc. for binary formats, or *.b64.json* for base64 combined image

    * **prefix** *(required)*: takes a list; the first element is a prefix of the path given in <output_image>, leading up to, but not including, the library name space of the output image; this prefix will be stripped from the output path, and will be replaced by an optional second element of this setting, to eventually obtain the image id of the output image;
    * **layout** : either "horizontal" or "vertical"; defines the layout of images within the combined image (default: "horizontal")
    * **input** *(required)*: list of groups of input files, each group sharing the same prefix; each group consists of:

       * **prefix** *(required)*: takes a list; analogous to the *prefix* attribute of the output image, the first element of the setting will be stripped from the path of each input file, and replaced by an optional second element, to obtain the corresponding image id
       * **files** : the list of input image files (:ref:`file globs <pages/tool/generator/generator_config_articles#file_globs>` allowed); may be relative to config file location

The image id's of both the input and output files will be collected in an accompanying *<output_name>.meta* file, for later processing by the generator when creating source and build versions of the app. You may move these files around after creation, but you'll have to keep the combined image and its .meta file together in the same directory. At generation time, the generator will look for an accompanying .meta file for every image file it finds in a library. The combined image's image id will be refreshed from its current location relative to the library's resource path. But the clipped images (the images inside the combined image) will be registered under the image id's given in the .meta file (and for browser that don't support combined images, they'll have to be available on disk under this exact image id).

.. _pages/tool/generator/generator_config_ref#compile:

compile
=======

Triggers the generation of a source or build version of the app. Takes a map.

::

  "compile" :
  {
    "type" : "(source|build|hybrid)"
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#compile-options`, :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#include`, :ref:`pages/tool/generator/generator_config_ref#library`

Generate Javascript file(s) for the application that can be loaded in the browser. This includes an initial file that acts as the loader and needs to be included by e.g. the hosting index.html page, and possibly other JS files with class code, I18N files, asf. All necessary settings for the compile run are given in the *compile-options* key, so make sure this one is properly filled.

Possible keys are

* **type** : which build type of the application should be generated (default: *source*); the types are:

  * **source** : all class code and other resources (images etc.) required for the application are referenced in their original source files on disk (e.g. application classes, framework classes, contrib/library classes, etc.); this is optimal for development and debugging (per-file error messages, setting break-points, additional checks and logging are enabled, etc.) but loads slower due to the many individual files; it is also less amenable to loading the application through a web server, and should usually be run directly from the disk (using the *file://* protocol)
  * **hybrid** : is also a development build type and combines some of the advantages of the build version with the source version; as with the source build type, a selected set of classes are loaded directly from their source files (as specified in :ref:`compile-options/code/except <pages/tool/generator/generator_config_ref#compile-options>`); the other classes required by the application are compiled together in common .js files; this allows for faster load times while retaining good debuggability of the selected classes
  * **build** : is the deployment build type; all classes are compiled into a set of common .js files, to minimize load requests; the class code is optionally compressed and optimized (cf. :ref:`compile-options/code/optimize <pages/tool/generator/generator_config_ref#compile-options>`); resource files from all involved libraries are copied to the build directory, so that it is fully functional and self-contained, and can be copied to e.g. a web server; this build type is unsuitable for development activities, as the code is hard to read and certain development features are optimized away, so it should only be used for production deployment of the application

.. _pages/tool/generator/generator_config_ref#compile-options:

compile-options
===============

Specify various options for compile (and other) keys. Takes a map.

::

  "compile-options" :
  {
    "paths" :
    {
      "file"            : "<path>",
      "file-prefix"     : "<path>",
      "app-root"        : "<path>",
      "gzip"            : (true|false),
      "loader-template" : "<path>"
    },
    "uris" :
    {
      "script"          : "script",
      "resource"        : "resource",
      "add-nocache-param" : (true|false)
    },
    "code" :
    {
      "format"          : (true|false),
      "locales"         : ["de", "en"],
      "optimize"        : ["basecalls", "comments", "privates", "strings", "variables", "variants", "whitespace"],
      "decode-uris-plug"  : "<path>",
      "except"          : ["myapp.classA", "myapp.util.*"],
      "lint-check"      : (true|false)
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#compile`,
  :ref:`pages/tool/generator/generator_config_ref#lint-check`

The *compile-options* key informs all compile actions of the generator. Settings of this key are used e.g. by the jobs that create the source and the build version of an application, though in varying degrees (e.g. the source job only utilizes a few of the settings in this key, and ignores the others). Output Javascript file(s) are generated into the directory of the *paths/file* value, with *path/file* itself being the primary output file. If *paths/file* is not given, the ``APPLICATION`` macro has to be set in the global :ref:`let <pages/tool/generator/generator_config#listing_of_keys_in_context>` section with a proper name, in order to determine a default output file name. For further information see the individual key descriptions to find out which build type utilizes it (in the descriptions, *(<type>)* refers to the :ref:`compile/type <pages/tool/generator/generator_config_ref#compile>`, e.g. *source* or *build*)

Possible keys are

* **paths** : paths for the generated output

  * **file** : the path to the compile output file; can be relative to the config's directory (default: *<type>/script/<appname>.js*)
  * **file-prefix** : path to a file containing %{JS} which will be inserted verbatim at the beginning of each generated output file; this could be a comment with copyright headers (default: *undefined*)
  * **app-root** : (*source*) relative (in the above sense) path to the directory containing the app's HTML page (default: *./source*)
  * **loader-template** : path to a JS file that will be used as an alternative loader template; for possible macros and structure see the default (default: *${QOOXDOO_PATH}/tool/data/generator/loader.tmpl.js*)
  * **gzip** : whether to gzip output file(s) (default: *false*)

* **uris** : URIs used to reference code and resources

  * **script** : (*build*) URI from application root to code directory (default: *"script"*)
  * **resource** : (*build*) URI from application root to resource directory (default: *"resource"*)
  * **add-nocache-param** : (*source*) whether to add a ``?nocache=<random_number>`` parameter to the URI, to overrule browser caching when loading the application; use the :doc:`ADD_NOCACHE_PARAM <generator_config_macros>` macro to tweak this setting for *source* builds (default: *false*)

* **code** : code options

  * **format** : (*build*) whether to apply simple output formatting (it adds some sensible line breaks to the output code) (default: *false*)
  * **locales** : (*build*) a list of locales to include (default: *["C"]*)
  * **optimize** : list of dimensions for optimization, max. ["basecalls",
    "comments", "privates", "statics", "strings", "variables", "variants",
    "whitespace"] (default: *[<all>]*) :doc:`special section
    </pages/tool/generator/generator_optimizations>`
  * **decode-uris-plug** : path to a file containing JS code, which will be plugged into the loader script, into the ``qx.$$loader.decodeUris()`` method. This allows you to post-process script URIs, e.g. through pattern matching. The current produced script URI is available and can be modified in the variable ``euri``.
  * **except** : (*hybrid*) exclude the classes specified in the class pattern list from compilation when creating a :ref:`hybrid <pages/tool/generator/generator_config_ref#compile>` version of the application
  * **lint-check** : (*experimental*) whether to perform lint checking during compile
    (default: *true*)


.. _pages/tool/generator/generator_config_ref#config-warnings:

config-warnings
===============

*(experimental)*

Taylor configuration warnings. This key can appear both at the config top-level, or at the job-level. Takes a map.

::

  "config-warnings" :
  {
    "job-shadowing"    : ["source-script"],
    "tl-unknown-keys"  : ["baz", "bar"],
    "job-unknown-keys" : ["foo", "bar"],
    "<config_key>"     : ["*"]
  }

Turn off warnings printed by the generator to the console for specific configuration issues. The key is honored both at the top level of the configuration map, and within individual jobs, but some of the sub-keys are only sensible if used at the top-level (This is indicated with the individual key in the list below). Warnings are on by default (equivalent to assigning e.g. *["\*"]* to the corresponding key). Like with the global *let*, a top-level *config-warnings* key is inherited by every job in the config, so its settings are like job defaults. If a given key is not applicable in its context, it is ignored. To turn off **all** warnings for a single generator run (independent of settings given in this key) use the generator ``-q`` :ref:`command line option <pages/tool/generator/generator_usage#command-line_options>`.

* **job-shadowing** *(top-level)* : Job names listed here are not warned about if the current config has a job of this name, and shadows another job of the same name from an included configuration.
* **job-unknown-keys** : List of config keys within a job which are unknown to the generator, but should not be warned about.
* **tl-unknown-keys** *(top-level)* : List of config keys on the top-level configuration map which are unknown to the generator, but should not be warned about.
* **<config_key>** : This is a generic form, where *<config_key>* has to be a legal job-level configuration key (Unknown keys, as stated above, are silently skipped). Currently supported keys are ``exclude``, but more keys (like "let", "packages", ...) might follow. The usual value is a list, where the empty list *[]* means that config warnings for this key are generally on (none exempted), and *["\*"]* means they are generally off (all exempted). The interpretation of the value is key dependent.

  * **exclude** : *[]* List of class patterns in the *exclude* key that the generator should not warn about.

  * **include** : *true/false* Warn about classes which are included without their dependencies.

  * **combine-images** : *true/false* Warn about missing or incorrect prefix spec for the images that go into the combined image.

  * **environment** : *[]* The key recognizes specific elements in its list value:

    * **non-literal-keys** : Don't warn if calls to `qx.core.Environment` use non-literal keys (e.g. *"qx.core.Environment.get(foo)"* where *foo* is a variable).
    * **variants-and-url-settings** : Don't warn if the `qx.allowUrlSettings:true` environment is set while at the same time `variants` optimization is on (the two sort of contradict each other).


.. _pages/tool/generator/generator_config_ref#copy-files:

copy-files
==========

Triggers files/directories to be copied. Takes a map.

::

  "copy-files" :
  {
    "files"     : [ "<path>", "<path>" ],
    "source" : "<path>",
    "target"  : "<path>"
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

Possible keys are

* **files** *(required)* : an array of files/directories to copy; entries will be interpreted relative to the ``source`` key value
* **source** : root directory to copy from; may be relative to config file location (default: "source")
* **target**  : root directory to copy to; may be relative to config file location (default: "build")

.. _pages/tool/generator/generator_config_ref#copy-resources:

copy-resources
==============

Triggers the copying of resources. Takes a map.

::

  "copy-resources" :
  {
    "target" : "<path>"
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#include`, :ref:`pages/tool/generator/generator_config_ref#library`

Possible keys are

* **target** : root target directory to copy resources to; may be relative to
  the config file location (default: "build")

Unlike :ref:`pages/tool/generator/generator_config_ref#copy-files`,
``copy-resources`` does not take either a "source" key, nor a "files" key.
Rather, a bit of implicit knowledge is applied. Resources will be copied from
the involved libraries' ``source/resource`` directories (this obviates a
"source" key). The list of needed resources is derived from the class files
(e.g. from ``@asset`` hints - this obviates the "files" key), and then the
libraries are searched for in order. From the first library that provides a
certain resource, this resource is copied to the target folder. This way you can
use most resources from a standard library (like the qooxdoo framework library),
but still "shadow" a few of them by resources of the same path from a different
library, just by tweaking the order in which these libraries are listed in the
:ref:`pages/tool/generator/generator_config_ref#library` key.


.. _pages/tool/generator/generator_config_ref#default-job:

default-job
============

Default job to be run. Takes a string.

::

  "default-job" : "source"

If this key is present in a configuration file, the named job will be run by default when no job argument is passed to the generator on the command line.


.. _pages/tool/generator/generator_config_ref#dependencies:

dependencies
============

Allows you to influence the way class dependencies are processed by the generator. Takes a map.

::

  "dependencies" :
  {
    "follow-static-initializers"  : (true|false),
    "sort-topological"            : (true|false)
  }

* **follow-static-initializers** *(not used!)*: Try to resolve dependencies introduced in class definitions when calling static methods to initialize map keys (default: *false*).
* **sort-topological** *(not used!)*: Sort the classes using a topological sorting of the load-time dependency graph (default: *false*).

.. _pages/tool/generator/generator_config_ref#desc:

desc
====

Provides some descriptive text for the job.

::

  "desc" : "Some text."

The descriptive string provided here will be used when listing jobs on the command line. (Be aware since this is a normal job key it will be passed on through job inheritance, so when you look at a specific job in the job listing you might see the job description of some ancestor job).


.. _pages/tool/generator/generator_config_ref#environment:

environment
===========

Define global key-value mappings for the application. Takes a map.

::

  "environment" :
  {
    "<key>" : (value | [<value>, ... ])
  }

The "environment" of a qooxdoo application can be viewed as a global, write-once key-value store. The *environment* key in a configuration allows you to pre-define values for such keys. All key-value pairs are available at run time through `qx.core.Environment <http://api.qooxdoo.org/%{version}/#qx.core.Environment>`_. There are pre-defined keys that are established by qooxdoo, and you can add user-defined keys. Both are handled the same.

Possible keys are

* **<key>** : a global key; keys are just strings; see `qx.core.Environment`_ for a list of pre-defined keys; if you provide a user-defined key, make sure it starts with a name space and a dot (e.g. *"myapp.keyA"*); the entry's value is either a scalar value, or a list of such values.

As soon as you specify more than one element in the list value for a key, the generator will generate different builds for each element. If the current job has more than one key defined with multiple elements in the value, the generator will generate a dedicated build **for each possible combination** of the given keys. See special section.

:ref:`Special section <pages/tool/generator/generator_config_articles#environment_key>`


.. _pages/tool/generator/generator_config_ref#exclude:

exclude
=======

Exclude classes from processing in the job. Takes an array of class specifiers.

::

  "exclude" : ["qx.util.*"]

Classes specified through the *exclude* key are excluded from the job
processing, e.g. from the generated build output. The class specifiers can
include simple wildcards like ``"qx.util.*"`` denoting class id's matching this
pattern, including those from sub-name spaces.

A leading ``=`` in front of a class specifier (like in ``"=qx.util.*"``) means
to also remove all  dependencies of the specified classes from the build,
irrespective of whether they are required by other classes as well. So this will
create builds that are no longer self-contained, and will break at runtime
unless the required classes are provided otherwise.

When building an application the class patterns given in the *exclude* key will
automatically be added to the list of
:ref:`allowed globals <pages/tool/generator/generator_config_ref#lint-check>` when
checking for unknown global symbols, so they will not be warned about.


.. _pages/tool/generator/generator_config_ref#export:

export
======

List of jobs to be exported if this config file is included by another, or to the generator if it is an argument.

::

  "export" : ["job1", "job2", "job3"]

Only exported jobs will be seen by importing config files. If the current configuration file is used as an argument to the generator (either implicitly or explicitly with *-c*), these are the jobs the generator will list with *generate.py x*, and only these jobs will be runnable with *generate.py <jobname>*.

.. _pages/tool/generator/generator_config_ref#extend:

extend
======

Extend the current job with other jobs. Takes an array of job names.

::

  "extend" : [ "job1", "job2", "job3" ]

The information of these (previously defined) jobs are merged into the current job description. Keys and their values missing in the current description are added, existing keys take precedence and are retained (with some keys that are merged).

:ref:`Special section <pages/tool/generator/generator_config_articles#extend_key>`

.. _pages/tool/generator/generator_config_ref#fix-files:

fix-files
=========

Fix white space in Javascript class files. Takes a map.

::

  "fix-files" :
  {
    "eol-style" : "(LF|CR|CRLF)",
    "tab-width" : 2
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#library`

*fix-files* will normalize white space in source code, by converting tabs to spaces, removing trailing white space in lines, and unifying the line end character sequence.

Possible keys are

* **eol-style** : determines which line end character sequence to use (default: *LF*)
* **tab-width** : the number of spaces to replace tabs with (default: *2*)

.. _pages/tool/generator/generator_config_ref#include:

include
=======

Include classes to be processed in the job. Takes an array of class specifiers.

::

  "include" : ["qx.util.*"]

The class specifiers can include simple wildcards like 'qx.util.*' denoting all classes starting with the 'qx.util' name space. A leading ``=`` in front of a class specifier (e.g. '=qx.util.*') means 'without dependencies'. In this case, exactly the listed classes are included (wildcards expanded), but not their dependencies. Otherwise, for the given classes their dependencies are calculated recursively, and those classes are also included. (default: [ ":ref:`${APPLICATION} <pages/tool/generator/generator_config_macros#application>`.Application", ":ref:`${QXTHEME} <pages/tool/generator/generator_config_macros#qxtheme>`" ])

.. _pages/tool/generator/generator_config_ref#include_top-level:

include (top-level)
===================

Include external config files. Takes a list of maps.

::

  "include" :
  [
    {
      "path"   : "<path>",
      "as"     : "<name>",
      "import" : ["job1", "job2", "job3"],
      "block"  : ["job4", "job5"]
    }
  ]

Within each specifying map, you can specify

* **path** *(required)*: Path string to the external config file which is interpreted *relative* to the current config file
* **as** : Identifier that will be used to prefix the external job names on import; without it, job names will be imported as they are.
* **import** : List of job names to import; this list will be intersected with the ``export`` list of the external config, and the resulting list of jobs will be included. :  A single entry can also be a map of the form *{"name": <jobname>, "as": <alias>}*, so you can import individual jobs under a different name.
* **block** : List of job names to block during import; this is the opposite of the ``import`` key and allows you to block certain jobs from being imported (helpful if you want to import most but not all of the jobs offered by the external configuration).

:ref:`Special section <pages/tool/generator/generator_config_articles#include_key_top-level_-_adding_features>`

.. _pages/tool/generator/generator_config_ref#jobs:

jobs
====

Define jobs for the generator. Takes a map.

::

  "jobs" :
  {
    "<job_name>" : { <job_definition> }
  }

Job definitions can take a lot of the predefined keys that are listed on this page (see the :ref:`overview <pages/tool/generator/generator_config#listing_of_keys_in_context>` to get a comprehensive list). The can hold "actions" (keys that cause the generator to perform some action), or just settings (which makes them purely declarative). The latter case is only useful if those jobs are included by others (through the :ref:`pages/tool/generator/generator_config_ref#extend` key, and thus hold settings that are used by several jobs (thereby saving you from typing).

.. _pages/tool/generator/generator_config_ref#let:

let
===

Define macros. Takes a map.

::

  "let" :
  {
    "<macro_name>"  : "<string>",
    "<macro_name1>" : [ ... ],
    "<macro_name2>" : { ... }
  }

Each key defines a macro and the value of its expansion. The expansion may contain references to previously defined macros (but no recursive references). References are denoted by enclosing the macro name with ``${...}`` and can only be used in strings. If the value of the macro is a string, references to it can be embedded in other strings (e.g. like "/home/${user}/profile"); if the value is a structured expression, like an array or map, references to it must fill the entire string (e.g. like "${MyList}").

* <macro_name> : The name of the macro.

:ref:`Special section <pages/tool/generator/generator_config_articles#let_key>`

.. _pages/tool/generator/generator_config_ref#let_top-level:

let (top-level)
===============

Define default macros. Takes a map (see the other :ref:`'let' <pages/tool/generator/generator_config_ref#let>`). Everything of the normal 'let' applies here, except that this let map is included automatically into every job run. There is no explicit reference to it, so be aware of side effects.

.. _pages/tool/generator/generator_config_ref#library:

library
=======

Define libraries to be taken into account for this job. Takes an array of maps.

::

  "library" :
  [
    {
      "manifest"   : "<path_or_url>",
      "uri"        : "<from_html_to_manifest_dir>"
    }
  ]

Each map can contain the keys

* **manifest** *(required)* : specifies the qooxdoo library to use:

  * *local file system path*: This must reference the Manifest file of
    the library; may be relative to config file location.

* **uri** : URI prefix from your HTML file to the directory of the library's
  "Manifest" file

:ref:`Special section <pages/tool/generator/generator_config_articles#library_key_and_manifest_files>`

.. _pages/tool/generator/generator_config_ref#lint-check:

lint-check
==========

Check JavaScript source code with a lint-like utility. Takes a map.

::

  "lint-check" :
  {
    "allowed-globals" : [ "qx", "${APPLICATION}" ],
    "ignore-catch-param"            : (true|false),
    "ignore-deprecated-symbols"     : (true|false),
    "ignore-environment-nonlit-key" : (true|false),
    "ignore-multiple-mapkeys"       : (true|false),
    "ignore-multiple-vardecls"      : (true|false),
    "ignore-no-loop-block"          : (true|false),
    "ignore-reference-fields"       : (true|false),
    "ignore-undeclared-privates"    : (true|false),
    "ignore-undefined-globals"      : (true|false),
    "ignore-shadowing-locals"       : (true|false),
    "ignore-unused-parameter"       : (true|false),
    "ignore-unused-variables"       : (true|false),
    "run"                           : (true|false),
    "warn-unknown-jsdoc-keys"       : (true|false),
    "warn-jsdoc-key-syntax"         : (true|false)
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#library`, :ref:`pages/tool/generator/generator_config_ref#include`

The general idea of the *ignore-\** options is to say that the lint checking will check as much issues as it can, and you can turn off certain checks by setting their *ignore-\** option to true. A few that are considered too picky are also true in the default config. Those can of course be enabled by setting them to false in your own configuration.

Keys are:

* **allowed-globals** : list of names that are not to be reported as bad use of globals

* **ignore-catch-param** *(experimental)*     :
    Don't check whether the exception parameter of a *catch* clause might overwrite an existing variable binding (s. `bug#1207 <%{bug}1207>`__). *(default: false)*

* **ignore-deprecated-symbols** *(experimental)*     :
    Ignore built-in symbols that are considered bad use, like *alert* or *eval*. *(default: false)*

* **ignore-environment-nonlit-key** *(experimental)* :
    Ignore calls to *qx.core.Environment.(get|select)* with a non-literal key (Those calls cannot be optimized). *(default: false)*

* **ignore-multiple-mapkeys** *(experimental)*       :
    Ignore using the same key in a map multiple times (Only the last occurrence will persist). *(default: false)*

* **ignore-multiple-vardecls** *(experimental)*      :
    Ignore multiple declarations of the same variable (Ie. multiple 'var' statements for the same identifier). *(default: true)*

* **ignore-no-loop-block** *(experimental)*          :
    Ignore bodies of loops or conditions that are not enclosed in ``{`` and ``}``. *(default: false)*

* **ignore-reference-fields** *(experimental)*       :
    Ignore reference data types in :ref:`class member attributes <pages/classes#instance_members>` (Those values will be shared across all instances of the class). *(default: false)*

* **ignore-undeclared-privates** *(experimental)*    :
    Ignore use of :ref:`private members <pages/classes#access>` in class code without them being declared in the class map. *(default: false)*

* **ignore-undefined-globals** *(experimental)*      :
    Ignore symbols that belong to the global scope, and are not recognized as known built-in symbols or class names (You usually want to avoid those). With this option set to *false*, i.e. those globals being warned about, you can still silence the warning for symbols given in the ``allowed-globals`` option. *(default: false)*

* **ignore-shadowing-locals** *(experimental)*      :
    Ignore variables declared in a local scope (function) that shadow global
    library symbols (such as *qx*, *q*, *qxWeb*). With this options set to
    *false*, code places like ::

      var qx = "foo";

    are warned about. (With such a code line you wouldn't be able to use any
    %{qooxdoo} framework class in this function anymore).  *(default: false)*

* **ignore-unused-parameter** *(experimental)*       :
    Ignore parameters of functions or catch statements that are not used in their respective body. *(default: true)*

* **ignore-unused-variables** *(experimental)*       :
    Ignore variables that are declared in a scope but not used. *(default: false)*

* **run** *(experimental)* :
    When set to *true* the actual lint checking will be performed. This key allows you to carry lint options in jobs without actually triggering the lint action. *(default: false)*

* **warn-unknown-jsdoc-keys** *(experimental)* :
    Unknown JSDoc @ keys are generally accepted (i.e. keys not listed in :doc:`/pages/development/api_jsdoc_ref`); setting this option to *true* will issue a warnings about them. *(default: false)*

* **warn-jsdoc-key-syntax** *(experimental)* :
    Warn if a known @ key is encountered that does not comply to the parsing rules (as given in :doc:`/pages/development/api_jsdoc_ref`); setting this option to *false* will disable warnings about them. *(default: true)*


.. _pages/tool/generator/generator_config_ref#log:

log
===

Configure log/reporting features. Takes a map.

::

  "log" :
  {
    "classes-unused" : [ "custom.*", "qx.util.*" ],
    "dependencies"   :
    {
      "type"         : ("using"|"used-by"),
      "phase"        : ("runtime"|"loadtime"|null),
      "include-transitive-load-deps" : (true|false),
      "force-fresh-deps" : (true|false),
      "format"       : ("txt"|"dot"|"json"|"provider"|"flare"|"term"),
      "dot"          :
      {
        "root"           : "custom.Application",
        "file"           : "<filename>",
        "radius"         : 5,
        "span-tree-only" : (true|false),
        "compiled-class-size" : (true|false)
      },
      "json"         :
      {
        "file"       : "<filename>",
        "pretty"     : (true|false)
      },
      "flare"        :
      {
        "file"       : "<filename>",
        "pretty"     : (true|false)
      }
    },
    "filter"         :
    {
      "debug"        : [ "generator.code.PartBuilder.*" ]
    },
    "privates"       : (true|false),
    "resources"      :
    {
      "file"         : "<filename>"
    },
    "translations"   :
    {
      "untranslated-keys":
      {
        "skip-locales"   : ["C"]
      }
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#include`, :ref:`pages/tool/generator/generator_config_ref#library`, :ref:`pages/tool/generator/generator_config_ref#compile-options`

This key allows you to enable logging features along various axes.

* **classes-unused** : Report unused classes for the name space patterns given in the list.
* **dependencies** : print out dependency relations of classes

  * **type** *(required)*: which kind of dependencies to log

    * ``using``: dependencies of the current class to other classes; uses the **using** key; supports ``txt``, ``dot``, ``json`` and ``flare`` output formats
    * ``used-by``: dependencies of other classes to the current class; supports only ``txt`` format

  * **phase** : limit logging to run-time or load-time dependencies; use ``null`` if you want to have both (default: *loadtime*)
  * **include-transitive-load-deps** : for *load-time* dependencies, whether transitive dependencies (i.e. dependencies that are not lexically in the code, but are required at load-time by some lexical dependency) should be included (default: *true*)
  * **force-fresh-deps** : force to re-calculate the class dependencies before logging them; this will take considerably longer but assures that the dependencies match exactly the latest state of the source trees (interesting after *statics* optimization; default: *false*)
  * **format** : format of the dependency output (default: *txt*)

    * ``txt``: textual output to the console
    * ``dot``: generation of a Graphviz dot file; uses the **dot** key
    * ``json``: "native" Json data structure (reflecting the hierarchy of the txt output class -> [run|load]); uses the **json** key
    * ``provider``: similar to the ``json`` output, but all id's are given as path suffixes (slashes between name spaces, file extensions), and dependencies are extended with resource id's and translatable string keys (as ``translation#<key>``); uses the **json** key
    * ``flare``: Json output suitable for prefuse Flare dependency graphs; uses the **flare** key
    * ``term``: textual output to the console, in the form of a term *depends(<class>, [<load-deps>,...], [<run-deps>,...])*

  * **dot**:

    * **span-tree-only**: only create the spanning tree from the root node, rather than the full dependency graph; reduces graph complexity by limiting incoming edges to one (i.e. for all classes at most one arrow pointing to them will be shown), even if more dependency relations exist
    * **root** : the root class for the ``dot`` format output; only dependencies starting off of this class are included
    * **file** : output file path (default *deps.dot*)
    * **radius** : include only nodes that are within the given radius (or graph distance) to the root node
    * **compiled-class-size** : use compiled class size to highlight graph nodes, rather than source file sizes; if true classes might have to be compiled to determine their compiled size, which could cause the log job to run longer; compile optimization settings are searched for in :ref:`compile-options/code/optimize <pages/tool/generator/generator_config_ref#compile-options>`, defaulting to none;  (default *true*)

  * **json**:

    * **file** : output file path (default *deps.json*)
    * **pretty** : produce formatted Json, with spaces and indentation; if *false* produce compact format (default: *false*)

  * **flare**:

    * **file** : output file path (default *flare.json*)
    * **pretty** : produce formatted Json, with spaces and indentation; if *false* produce compact format (default: *false*)

* **filter** : allows you to define certain log filter

  * **debug** : in debug ("verbose") logging enabled with the ``-v`` command line switch, only print debug messages from generator modules that match the given pattern

* **privates** : print out list of classes that use a specific private member
* **resources**: writes the map of resource info for the involved classes to a json-formatted file

  * **file** : output file path (default *resources.json*)

* **translations** : influence messages about translations

  * **untranslated-keys** :

    * **skip-locales** : skip locales given in the list when reporting about untranslated msgid's in a built application (default: *[]*)


:ref:`Special section <pages/tool/generator/generator_config_articles#log_key>`.

.. _pages/tool/generator/generator_config_ref#migrate-files:

migrate-files
=============

Migrate source files to current qooxdoo version. Takes a map.

::

  "migrate-files" :
  {
     "from-version" : "0.7",
     "migrate-html" : false
  }

This key will invoke the mechanical migration tool of qooxdoo, which will run through the class files an apply successive sequences of patches and replacements to them. This allows to apply migration steps automatically to an existing qooxdoo application, to make it better comply with the current SDK version (the version the key is run in). Mind that you might have to do further adaptions by hand after the automatic migration has run. The migration tool itself is interactive and allows entering migration parameters by hand.

* **from-version** : qooxdoo version of the code before migration
* **migrate-html** : whether to patch .html files in the application (e.g. the index.html)

.. _pages/tool/generator/generator_config_ref#name:

name
====

Provides some descriptive text for the whole configuration file.

::

  "name" : "Some text."

.. _pages/tool/generator/generator_config_ref#packages:

packages
========

Define packages for this app. Takes a map.

::

  "packages" :
  {
    "parts"  :
    {
      "<part_name>" :
      {
        "include"                  : [ "app.class1", "app.class2", "app.class3.*" ],
        "expected-load-order"      : 1,
        "no-merge-private-package" : (true|false)
      }
    },
    "sizes"  :
    {
      "min-package"           : 1,
      "min-package-unshared"  : 1
    },
    "init"             : "<part_name>",
    "separate-loader"  : (true|false),
    "i18n-as-parts"    : (true|false),
    "additional-merge-constraints" : (true|false),
    "verifier-bombs-on-error"      : (true|false)
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#compile`, :ref:`pages/tool/generator/generator_config_ref#library`, :ref:`pages/tool/generator/generator_config_ref#include`

Keys are

* **parts** : map of part names and their properties

  * <part_name> :

    * **include** *(required)*: list of class patterns
    * **expected-load-order** : integer > 0 (default: *undefined*)
    * **no-merge-private-package** : whether the package specific to that
      individual part should not be merged; this can be used when carving out
      resource-intensive parts (default: *false*)

* **sizes** : size constraints on packages

  * **min-package** : minimal size of a package in KB (default: 0)
  * **min-package-unshared** : minimal size of an unshared package in KB
    (default: <min-package>)

* **init** : name of the initial part, i.e. the part to be loaded first
  (default: *"boot"*)
* **separate-loader** : whether loader information should be included with the
  boot package, or be separate; if set true, the loader package will contain no
  class code (default: *false*)
* **i18n-as-parts** : whether internationalization information (translations,
  CLDR data) should be included with the packages, or be separate; if set true,
  the code packages will contain no i18n data; rather, i18n data will be generated
  in dedicated parts, which have to be loaded by the application explicitly; see
  :ref:`special section
  <pages/tool/generator/generator_config_articles#i18n-with-boot>` (default:
  *false*)
* **additional-merge-constraints** : if set to false, the generator will be more
  permissive when merging packages which might result in fewer packages in the
  end, but can also result in inconsistencies which the part verifier will
  complain about (default: *true*)
* **verifier-bombs-on-error** : whether the part verifier should raise an
  exception, or just warn and continue (default: *true*)

:ref:`Special section <pages/tool/generator/generator_config_articles#packages_key>`

.. _pages/tool/generator/generator_config_ref#pretty-print:

pretty-print
============

Triggers code beautification of source class files (in-place-editing). An empty map value triggers default formatting, but further keys can tailor the output.

::

  "pretty-print" :
  {
    "general" :
    {
      "indent-string"        : "  ",
      "text-width"           : 80
    },
    "comments" :
    {
      "block"  :
      {
        "add"  : true
      },
      "trailing" :
      {
        "keep-column"        : false,
        "comment-cols"       : [50, 70, 90],
        "padding"            : "  "
      }
    },
    "code" :
    {
      "align-with-curlies"   : false,
      "open-curly" :
      {
        "newline-before"     : "m",
        "indent-before"      : false
      }
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#library`, :ref:`pages/tool/generator/generator_config_ref#include`

Keys are:

* **general** : General settings.

  * **indent-string** : "<whitespace_string>", e.g. "\\t" for tab (default: *"  "* (2 spaces))
  * **text-width** : <int >= 0> the intended text width for each source line (0 disables text width); this width is striven for, but is not a hard limit (e.g. string literals that are longer are not broken up). (default: *0*)

* **comments** : Settings for pretty-printing comments.

  * **block** : Settings for block comments ("/\*...\*/")

    * **add** : (true|false) Whether to automatically add JSDoc comment
      templates, e.g. ahead of method definitions (default: *false*)

  * **trailing** : Settings for pretty-printing comments that start after some
    code and do not end before the end of the line ("//..." and "/\*...\*/").

    * **keep-column** : (true|false) Tries to fix the start column of trailing
      comments to the value in the original source (default: *false*)
    * **comment-cols** : [n1, n2, ..., nN] Column positions to start trailing
      comments at, e.g. [50, 70, 90] (default: *[]*)
    * **padding** : "<whitespace_string>" White space to be inserted after
      statement end and beginning of comment (default: *"  "* (2 spaces))

* **code** : Settings for pretty-printing code blocks.

  * **align-with-curlies** : (true|false) Whether to put a block at the same
    column as the surrounding/ending curly bracket (default: *false*)
  * **open-curly** : Settings for the opening curly brace '{'.

    * **newline-before** : "([aA]|[nN]|[mM])" Whether to insert a line break
      before the opening curly always (aA), never (nN) or mixed (mM) depending on
      block complexity (default: *"m"*)
    * **indent-before** : (true|false) Whether to indent the opening curly if it
      is on a new line (default: *false*)

.. _pages/tool/generator/generator_config_ref#provider:

provider
============

Collects application classes, resources, translatable strings and dependency information in a specific directory structure, under the ``provider`` root directory. Takes a map.

::

  "provider" :
  {
    "app-root" : "./provider",
    "include"  : ["${APPLICATION}.*"],
    "exclude"  : ["${APPLICATION}.test.*"]
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#library`, :ref:`pages/tool/generator/generator_config_ref#cache`

Keys are:

* **app-root** : Chose a different root directory for the output (default: *./provider*).
* **include**  : Name spaces for classes and resources to be included (default: *${APPLICATION}.\**).
* **exclude**  : Name spaces for classes and resources to be excluded (default: *${APPLICATION}.test.\**).


.. _pages/tool/generator/generator_config_ref#require:

require
=======

Define prerequisite classes needed at load time. Takes a map.

::

  "require" :
  {
    "<class_name>" : [ "qx.util", "qx.fx" ]
  }

Each key is a

* <class_name> : each value is an array of required classes for this class.

.. _pages/tool/generator/generator_config_ref#run:

run
===

Define a list of jobs to run. Takes an array of job names.

::

  "run" : [ "<job1>", "<job2>", "<job3>" ]

These jobs will all be run in place of the defining job (which is sort of a 'meta-job'). All further settings in the defining job will be inherited by the listed jobs (so be careful of side effects).

:ref:`Special section <pages/tool/generator/generator_config_articles#run_key>`


.. _pages/tool/generator/generator_config_ref#shell:

shell
=====

Triggers the execution of external commands. Takes a map.

::

  "shell" :
  {
    "command" : ("echo foo bar baz"|["echo foo", "echo bar", "echo baz"])
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

Possible keys are

* **command** : command string or list of command strings to execute by shell

*Note*: Generally, the command string is passed to the executing shell "as is", with one exception: Relative paths are absolutized, so you can run those jobs from remote directories. In order to achieve this, all strings of the command are searched for path separators (e.g. '/' on Posix systems, '\\' on Windows - be sure to encode this as '\\\\' on Windows as '\\' is the Json escape character). Those strings are regarded as paths and - unless they are already absolute - are absolutized, relative to the path of the current config. So e.g. instead of writing ::

    "cp file1 file2"

you should write ::

    "cp ./file1 ./file2"

and it will work from everywhere.

* **command-not-found** : message string to be shown if command is not found within PATH system variable and it's not a built-in shell command

.. _pages/tool/generator/generator_config_ref#slice-images:

slice-images
============

Triggers cutting images into regions. Takes a map.

::

  "slice-images" :
  {
    "convert-cmd" : "<string_template>",
    "images" :
    {
      "<input_image>" :
      {
          "prefix"       : "<string>",
          "border-width" : (5 | [5, 10, 5, 10]),
          "trim-width"   : (true|false)
      }
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

.. note::

  This key requires an external program (ImageMagic) to run successfully.

* **convert-cmd** *(experimental)*: command line for the ImageMagick `convert` command. If you create clippings of an image, the *convert* command line utility will be invoked. This command template will be used to invoke it, and is exposed here so you can adjust it to your local ImageMagick installation. If you tweak this template and shuffle things around, make sure the placeholders ``%(<name>)s`` remain intact. Example value:

  * ``"convert %(infile)s -crop %(xoff)sx%(yoff)s+%(xorig)s+%(yorig)s +repage %(outfile)s"`` *(for ImageMagick v5.x, v6.x)*

  (default: *""*)

* **images** : map with slice entries.

  * **<input_image>** :  path to input file for the slicing; may be relative to config file location

    * **prefix** *(required)* : file name prefix used for the output files; will be interpreted relative to the input file location (so a plain name will result in output files in the same directory, but you can also navigate away with ``../../....`` etc.)
    * **border-width** : pixel width to cut into original image when slicing borders etc. Takes either a single integer (common border width for all sides) or an array of four integers (top, right, bottom, left).
    * **trim-width** : reduce the width of the center slice to no more than 20 pixels. (default: *true*)

.. _pages/tool/generator/generator_config_ref#font_map_ref:

font-map
========

Triggers the creation of a font map needed for icon fonts. This command uses the FontForge
package to analyze a given font. The resulting data is saved in your application package, so that
it is possible to lookup image sources like @FontAwesome/house.

::

  "font-map" :
  {
    "fonts" :
    {
      "${RESPATH}/foo/fonts/fontawesome-webfont.ttf" :
      {
        "prefix": [ "${RESPATH}" ],
        "alias" : "FontAwesome",
        "size" : 40
      }
    }
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

.. note::

  This key requires an external library (FontForge) to run successfully.

* **fonts** : map with font entries.

  * **<input_font>** :  path to input file for the slicing; may be relative to config file location

    * **prefix** *(required)* : file name prefix used for the output files; will be interpreted relative to the input file location (so a plain name will result in output files in the same directory, but you can also navigate away with ``../../....`` etc.)
    * **alias** : Alias used in the source identifier (i.e. FontAwesome as an alias will lead to @FontAwesome/ prefixes in your image source)
    * **size** : pixel width that is used for the icon font by default.

.. _pages/tool/generator/generator_config_ref#translate:

translate
=========

(Re-)generate the .po files (usually located in ``source/translation``) from source classes. Takes a map. The source classes of the  specified name space are scanned for translatable strings. Those strings are extracted and put into map files (.po files), one for each language. Those .po files can then be edited to contain the proper translations of the source strings. For a new locale, a new file will be generated. For existing .po files, re-running the job will add and remove entries as appropriate, but otherwise keep existing translations.

::

  "translate" :
  {
    "namespaces"                  : [ "qx.util" ],
    "locales"                     : [ "en", "de" ],
    "pofile-with-metadata"        : (true|false)
    "poentry-with-occurrences"    : (true|false)
    "occurrences-with-linenumber" : (true|false),
    "eol-style"                   : "(LF|CR|CRLF)"
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#library`

* **namespaces** *(required)* : List of name spaces for which .po files should be updated.
* **locales** :  List of locale identifiers to update.
* **pofile-with-metadata** : Whether meta data is automatically added to a *new* .po file; on existing .po files the meta data is retained (default: *true*)
* **poentry-with-occurrences** : Whether each PO entry is preceded by ``#:`` comments in the *.po* files, which indicate in which source file(s) and line number(s) this key is used (default: *true*)
* **occurrences-with-linenumber** : Enables (or suppress) appending of line-numbers to every PO entry comment (default: *true*). Only effective when *poentry-with-occurrences* is enabled.
* **eol-style** : Determines which line end character sequence to use (default: *LF*)

.. _pages/tool/generator/generator_config_ref#use:

use
===

Define prerequisite classes needed at run time. Takes a map.

::

  "use" :
  {
    "<class_name>" : [ "qx.util", "qx.fx" ]
  }

Each key is a

* **<class_name>** : each value is an array of used classes of this class.


.. _pages/tool/generator/generator_config_ref#validation-config:

validation-config
=================

Triggers the validation of the Config (*config.json*) against a schema and prints it to the console. Takes a map.

::

  "validation-config" : {}

This key currently takes no subkeys, but you still have to provide an empty map.

.. _pages/tool/generator/generator_config_ref#validation-manifest:

validation-manifest
===================

Triggers the validation of the Manifest (*Manifest.json*) against a schema and prints it to the console. Takes a map.

::

  "validation-manifest" : {}


This key currently takes no subkeys, but you still have to provide an empty map.


.. _pages/tool/generator/generator_config_ref#watch-files:

watch-files
===========

Watch arbitrary files or directories for changes.

::

  "watch-files" :
  {
    "paths"   : [ "file/or/dir/to/watch" ],
    "command" :
    {
      "line"  : "generate.py source",
      "per-file" : (true|false),
      "exec-on-startup" : (true|false),
      "exit-on-retcode" : (true|false)
    }
    "include" : [ "*.js" ],
    "include-dirs"    : (true|false),
    "check-interval"  : 10,
  }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`

* **paths** *(required)* : List of  paths to files or directories which should
  be watched. If an entry is a directory, it is watched recursively (directories
  themselves are included according to the ``include-dirs`` key).
* **command** :

  * **line** : *(required)* : Shell command line to be executed when a change is
    detected. There are a couple of placeholders available that can be
    interpolated into the command string with ``%(<KEY>)``. The different keys
    are:

    .. list-table::
      :widths: 10 90
      :header-rows: 1

      * - Key
        - Description
      * - ``FILELIST``
        - the (space-separated) list of file paths that have changed (e.g.
          *foo/bar/baz.js foo/bar/yeo.js*)
      * - ``FILE``
        - the individual file path that has changed (e.g. *foo/bar/baz.js*;
          interesting when *per-file* is true)
      * - ``DIRNAME``
        - the directory path of an individual file (e.g. *foo/bar* in
          *foo/bar/baz.js*)
      * - ``BASENAME``
        - just the basename of an individual file including extension (e.g.
          *baz.js* in *foo/bar/baz.js*)
      * - ``FILENAME``
        - the file name without path and extension (e.g. *baz* in *foo/bar/baz.js*)
      * - ``EXTENSION``
        - the file extension (e.g. *.js* in *foo/bar/baz.js*)


    For example, this can be used to create a command line like this ::

      sass %(FILE) > path/to/css/%(FILENAME).css

    which runs an SCSS compiler on a .scss file (assuming these files are
    watched), and redirects the output to a file with same name but a .css
    extension, in a different path.

    Mind that if you specified multiple ``paths`` the command will be applied if
    *any* of them change, but for all the execution context will be the same,
    e.g. have the same current directory. There is currently no implicit ``cd``
    or calculation of file paths relative to their watched roots or similar.

  * **per-file** : Whether the command should be executed for each file that has
    been changed. If true, command will be invoked for each file that has changed
    since the last check. (default: *false*)
  * **exec-on-startup**: Whether to execute the given command once when the
    watch job starts. This works independent of the *per-file* setting, but
    **Note**: If you are watching a lot of files, your shell's command line
    capacity might become exhausted for the first execution of command if you use
    the *%(FILELIST)* command macro in a *per-file:false* setting, as the
    Generator will try to pass *all watched files* on the command line.  (default
    *false*)
  * **exit-on-retcode**: Whether to terminate when the given command returns a
    return code != 0, or to continue in this case. (default *false*)

* **include** : List of file globs to be selected when watching a directory tree. (default: *[\*]*)
* **include-dirs** : Whether to include directories in the list of changed files when watching a directory tree. (default: *false*)
* **check-interval** : Seconds of elapsed time between checks for changes. (default: *2*)


.. _pages/tool/generator/generator_config_ref#web-server:

web-server
==========

*(experimental)*

Start a mini web server to serve local files.

::

    "web-server" :
    {
      "document-root" : "",
      "server-port"  : 8080,
      "log-level"    : "error",
      "allow-remote-access" : false,
      "active-reload" :
      {
        "client-script" : "<path>"
      }
    }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#library`

* **document-root** : File system path to use as the web server's document root.
  Best left empty, so the Generator calculates a common root path of all involved
  %{qooxdoo} libraries. For this to work, your libraries should be collected in
  the :ref:`"libraries" <pages/tool/generator/generator_default_jobs#libraries>`
  default job. (default: *""*)
* **server-port** : The port the server should listen on. ``0`` means to pick an
  arbitrary free port. (default: *0*)
* **log-level** : Log level of the server, ``"error"`` for errors, ``"info"``
  for more verbose logging, ``"fatal"`` for no logging. (default: *"error"*)
* **allow-remote-access** : Whether the web server allows access from other
  hosts. If set to false, access is only allowed from *localhost*. This is
  recommended as the web server might expose a substantial part of your hard disk,
  including directory indexes. (default: *false*)
* **active-reload** : Enabling active reload of the app in the browser.

  * **client-script** : The path to the client script which reloads the
    application in the browser if it has changed on disk. (default:
    *${QOOXDOO_PATH}/tool/data/generator/active_reload.js"*)


.. _pages/tool/generator/generator_config_ref#web-server-config:

web-server-config
==================

*(experimental)*

Create a web server configuration for the local source version.

::

    "web-server-config" :
    {
      "document-root" : "",
      "output-dir"     : ".",
      "template-dir"   : "<path>",
      "httpd-type"     : "apache2",
      "httpd-host-url" : "http://localhost:8080"
    }

.. note::

  peer-keys: :ref:`pages/tool/generator/generator_config_ref#cache`, :ref:`pages/tool/generator/generator_config_ref#library`

* **document-root** : File system path to use as the application's document root.
  Best left empty, so the Generator calculates a common root path of all involved
  %{qooxdoo} libraries. For this to work, your libraries should be collected in
  the :ref:`"libraries" <pages/tool/generator/generator_default_jobs#libraries>`
  default job. (default: *""*)
* **output-dir** : Directory path where the configuration file is stored. The
  file itself is named as ``"<httpd-type>.conf"`` so the name already exposes for
  which server it is being generated. (default: *.*)
* **template-dir** : Directory path where to look for web server-specific
  configuration templates. The file name itself is constructed as
  ``"httpd.<httpd-type>.tmpl.conf"``. (default: *${QOOXDOO_PATH}/tool/data/generator/*)

  Templates can make use of several macros that will be expanded during the
  generation process. Macros are referenced in the template with
  ``${<macro_name>}``. The following macros are supported:

  .. list-table::
    :widths: 40 60
    :header-rows: 1

    * - Macro
      - Description
    * - ``APP_DOCUMENT_ROOT``
      - the common root path of all libraries making up the application; this is
        usually mapped to an alias in the web server, so that all relative URLs to
        application files continue to work under the web server
    * - ``APP_NAMESPACE_AS_PATH``
      - the application's namespace, but with "/" in place of "." if it is a
        complex name; this is usually used as a web server alias in the
        configuration
    * - ``APP_HTTPD_CONFIG``
      - the absolute path to the generated configuration file
    * - ``LOCALHOST_APP_URL``
      - the URL with which the source version can be loaded

* **httpd-type** : The web server implementation. Currently supported types are
  (``apache2``, ``lighttpd``, ``nginx``). (default: *apache2*)
* **httpd-host-url** : The host URL part (including protocol) where the server
  can be contacted for which the configuration is being generated. (default: *http://localhost*)
