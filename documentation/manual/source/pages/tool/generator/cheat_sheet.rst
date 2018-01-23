%{qooxdoo} Generator Cheat Sheet - v.%{version}
*************************************************

This cheat sheet summarizes the options available for the generator and its Json config files. For full reference see: http://manual.qooxdoo.org/%{version}/pages/tool/generator/generator.html


Command-line Options
=====================

.. code-block:: none

    shell> generator.py -h
    Usage: generator.py [options] job,...

    Arguments:
      job,...               a list of jobs (like 'source' or 'copy-files',
                            without the quotes) to run
      x                     use 'x' (or some undefined job name) to get a
                            list of all available jobs from the configuration file

    Options:
      -h, --help            show this help message and exit
      -c CFGFILE, --config=CFGFILE
                            path to configuration file containing job definitions
                            (default: config.json)
      -q, --quiet           quiet output mode (extra quiet)
      -v, --verbose         verbose output mode of job processing
      -w, --config-verbose  verbose output mode of configuration processing
      -l FILENAME, --logfile=FILENAME
                            log file
      -s, --stacktrace      enable stack traces on fatal exceptions
      -m KEY:VAL, --macro=KEY:VAL
                            define/overwrite a global 'let' macro KEY with value
                            VAL
      -I, --no-progress-indicator
                            suppress animated progress indication


Default Jobs
=============

.. list-table::


    * - api
      - create api doc for the current library
    * - api-data
      - create api doc json data files
    * - build
      - create build version of current application
    * - clean
      - remove local cache and generated .js files (source/build)
    * - distclean
      - remove the cache and all generated artefacts of this library (source, build, ...)
    * - fix
      - normalize whitespace in .js files of the current library (tabs, eol, ...)
    * - info
      - collects environment information like the qooxdoo version etc., and prints it out
    * - lint
      - check the source code of the .js files of the current library
    * - migration
      - migrate the .js files of the current library to the current qooxdoo version
    * - pretty
      - pretty-formatting of the source code of the current library
    * - profiling
      - includer job, to activate profiling
    * - source
      - create source version of current application
    * - source-all
      - create source version of current application, with all classes
    * - source-httpd-config
      - generate a httpd configuration for the source version
    * - source-hybrid
      - create a hybrid application (application classes as individual files, others concatenated)
    * - source-server
      - start a lightweight web server that exports the source version
    * - test
      - create a test runner app for unit tests of the current library
    * - test-source
      - create a test runner app for unit tests (source version) of the current library
    * - translation
      - create .po files for current library
    * - validate-config
      - validates the *config.json* itself - if jobname arg is given checks dedicated job only
    * - validate-manifest
      - validates the given filepath as manifest (defaults to *./Manifest.json*)


Config File Layout
=====================
This is an overview of the available configuration keys with their corresponding nesting level.

* **name** - A name or descriptive text for the configuration file.
* **include** - Include external config files. Takes a list of maps, where each map specifies an external configuration file, and options how to include it.
* **let** - Define default macros. Takes a map (see the description of the job-level 'let' further down). This let map is included automatically into every job run. There is no explicit reference to it, so be aware of side effects.
* **export** - List of jobs to be exported if this config file is included by another.
* **default-job** - The name of a job to be run as default, i.e. when invoking the generator without job arguments.
* **config-warnings** - *(experimental)* Suppress warnings from configuration aspects which you know are ok.
* **jobs** - Map of jobs. Each key is the name of a job.

  * **<jobname>** Each job's value is a map describing the job. The describing map can have any number of the following keys:

    * **add-script** - A list of URIs that will be loaded first thing when the app starts.
    * **api** - Triggers the generation of a custom Apiviewer application.
    * **asset-let** - Defines macros that will be replaced in @asset hints in source files.
    * **cache** - Define the path to cache directories, most importantly to the compile cache.
    * **clean-files** - Triggers clean-up of files and directories within a project and the framework, e.g. deletion of generated files, cache contents, etc.
    * **collect-environment-info** - Collects various information about the qooxdoo environment (like version, cache, etc.) and prints it to the console.
    * **combine-images** - Triggers creation of a combined image file that contains various images.
    * **compile** - Triggers the generation of a source or build version of the application.
    * **compile-options** - Define various options that influence compile runs (both source and build version).
    * **config-warnings** - *(experimental)* Suppress warnings from configuration aspects which you know are ok.
    * **copy-files** - Triggers files/directories to be copied, usually between source and build version.
    * **copy-resources** - Triggers the copying of resources, usually between source and build version.
    * **dependencies** - Fine-tune the processing of class dependencies.
    * **desc** - A string describing the job.
    * **environment** - Define key:value pairs for the application, covering settings, variants and features.
    * **exclude** - List classes to be excluded from the job. Takes an array of class specifiers.
    * **extend** - Extend the current job with other jobs. Takes an array of job names. The information of these jobs are merged into the current job description, so the current job sort of "inherits" their settings.
    * **fix-files** - Fix white space in source files.
    * **include** - List classes to be processed in the job. Takes an array of class specifiers.
    * **let** - Define macros. Takes a map where each key defines a macro and the value its expansion.
    * **library** - Define libraries to be taken into account for this job. Takes an array of maps, each map specifying one library to consider. The most important part therein is the "manifest" specification.
    * **lint-check** - Check source code with a lint-like utility.
    * **log** - Tailor log output of job.
    * **migrate-files** - Migrate source code to the current qooxdoo version.
    * **packages** - Define packages for the application.
    * **pretty-print** - Triggers code beautification of source class files (in-place-editing). An empty map value triggers default formatting, but further keys can tailor the output.
    * **provider** - Collects classes, resources and dependency information and puts them in a specific directory structure under the provider root.
    * **require** - Define prerequisite classes needed at load time. Takes a map, where the keys are class names and the values lists of prerequisite classes.
    * **run** - Define a list of jobs to run in place of the current job.
    * **shell** - Triggers the execution of one or more external command(s).
    * **slice-images** - Triggers cutting images into regions.
    * **translate** - Re-generate .po files from source classes.
    * **use** - Define prerequisite classes needed at run time. Takes a map, where the keys are class names and the values lists of prerequisite classes.


Configuration Keys
====================
Here are the configuration keys with their individual value syntax.

::

  "add-css" :
  [
    {
      "uri" : "<css-uri>"
    }
  ]

  "add-script" :
  [
    {
      "uri" : "<script-uri>"
    }
  ]

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

  "asset-let" :
  {
    "<macro_name>" : [ "foo", "bar", "baz" ]
  }

  "cache" :
  {
    "compile"     : "<path>",
    "downloads"   : "<path>",
    "invalidate-on-tool-change" : (true|false)
  }

  "clean-files" :
  {
    "<doc_string>" :
    [
      "<path>",
      "<path>"
    ]
  }

  "collect-environment-info" : {}

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

  "compile" :
  {
    "type" : "(source|build|hybrid)"
  }

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
      "except"          : ["myapp.classA", "myapp.util.*"]
    }
  }

  "config-warnings" :
  {
    "job-shadowing"    : ["source-script"],
    "tl-unknown-keys"  : ["baz", "bar"],
    "job-unknown-keys" : ["foo", "bar"],
    "<config_key>"     : ["*"]
  }

  "copy-files" :
  {
    "files"     : [ "<path>", "<path>" ],
    "source" : "<path>",
    "target"  : "<path>"
  }

  "copy-resources" :
  {
    "target" : "<path>"
  }

  "default-job" : "source"

  "dependencies" :
  {
    "follow-static-initializers"  : (true|false),
    "sort-topological"            : (true|false)
  }

  "desc" : "Some text."

  "environment" :
  {
    "<key>" : (value | [<value>, ... ])
  }

  "exclude" : ["qx.util.*"]
  "export" : ["job1", "job2", "job3"]

  "extend" : [ "job1", "job2", "job3" ]

  "fix-files" :
  {
    "eol-style" : "(LF|CR|CRLF)",
    "tab-width" : 2
  }

  "include" : ["qx.util.*"]

  "include" :
  [
    {
      "path"   : "<path>",
      "as"     : "<name>",
      "import" : ["job1", "job2", "job3"],
      "block"  : ["job4", "job5"]
    }
  ]

  "jobs" :
  {
    "<job_name>" : { <job_definition> }
  }

  "let" :
  {
    "<macro_name>"  : "<string>",
    "<macro_name1>" : [ ... ],
    "<macro_name2>" : { ... }
  }

  "library" :
  [
    {
      "manifest"   : "<path>",
      "uri"        : "<from_html_to_manifest_dir>"
    }
  ]

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

  "migrate-files" :
  {
     "from-version" : "0.7",
     "migrate-html" : false
  }

  "name" : "Some text."

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

  "provider" :
  {
    "app-root" : "./provider",
    "include"  : ["${APPLICATION}.*"],
    "exclude"  : ["${APPLICATION}.test.*"]
  }

  "require" :
  {
    "<class_name>" : [ "qx.util", "qx.fx" ]
  }

  "run" : [ "<job1>", "<job2>", "<job3>" ]

  "shell" :
  {
    "command" : ("echo foo bar baz"|["echo foo", "echo bar", "echo baz"])
  }

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

  "translate" :
  {
    "namespaces"                  : [ "qx.util" ],
    "locales"                     : [ "en", "de" ],
    "pofile-with-metadata"        : (true|false),
    "poentry-with-occurrences"    : (true|false),
    "occurrences-with-linenumber" : (true|false),
    "eol-style"                   : "(LF|CR|CRLF)"
  }

  "use" :
  {
    "<class_name>" : [ "qx.util", "qx.fx" ]
  }

  "watch-files" :
  {
    "paths"   : [ "file/or/dir/to/watch" ],
    "command" :
    {
      "line"  : "generate.py source",
      "per-file" : (true|false)
    }
    "include" : [ "*.js" ],
    "include-dirs"    : (true|false),
    "check-interval"  : 10,
    "exit-on-retcode" : (true|false)
  }

  "web-server" :
  {
    "document-root" : "",
    "server-port"  : 8080,
    "log-level"    : "error",
    "allow-remote-access" : false
  }

  "web-server-config" :
  {
    "output-dir"     : ".",
    "template-dir"   : "<path>",
    "httpd-type"     : "apache2",
    "httpd-host-url" : "http://localhost:8080"
  }

