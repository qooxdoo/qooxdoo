.. _pages/tool/generator_config#generator_configuration_file:

Generator Configuration File
****************************

.. _pages/tool/generator_config#overview:

Overview
========

The configuration file that drives the generator adheres to the `JSON specification <http://json.org/>`_. It has the following general structure:

::

  {
    "name" : ...,
    "include : ...,
    "jobs" :
    {
      "job1" : { ... },
      "job2" : { ... },
      ...
      "jobN" : { ... }
    }
  }

The job names ``job1``, ..., ``jobN`` are freely chooseable names but must form a valid key. JavaScript-style comments (``/*...*/`` and ``//...``) are permissible but only in rather robust places, like after a comma or directly after opening or before closing parentheses, but e.g. not between a key and its value.

Quick links:

* :doc:`generator_config_ref`
* :doc:`generator_config_macros`
* :doc:`Configuration Detail Articles <generator_config_articles>`
* :doc:`Implementation Background Information <generator_config_background>`

.. _pages/tool/generator_config#example:

Example
=======

Here is an example of a minimal config file that defines a single job to create the source version of an application:

::

  {
    "jobs" :
    {
      "source" : 
      {
        "let" :
        {
          "QOOXDOO_PATH" : "../..",
          "APPLICATION" : "custom"
        ],

        "library" :
        [
          {
            "manifest"     : "${QOOXDOO_PATH}/framework/Manifest.json"
          },
          {
            "manifest"     : "./Manifest.json"
          }
        ],

        "compile-options" :
        {
          "paths" :  
            {
              "file" : "./source/script/${APPLICATION}.js"
            }
        },

        "compile" : { "type" : "source" },

        "require" :
        {
          "qx.log.Logger" : ["qx.log.appender.Native"]
        },

        "environment" : 
        {
          "qx.application" : "${APPLICATION}.Application"
        },

        "cache" :
        {
          "compile" : "../../cache2"
        }
      }
    }
  }

.. _pages/tool/generator_config#syntax:

Syntax
======

Apart from the general Json rules, you can place '=' in front of job and key names, to indicate that this feature should prevail as specified when configs get merged. See :ref:`here <pages/tool/generator_config_articles#job_shadowing_and_partial_overriding>` for more details on that. The config system also allows the use of *macros*, details of which can be found :ref:`here <pages/tool/generator_config_articles#let_key>`. If you use keys outside those listed here in your configuration, you will be warned about them, and they will be ignored in the processing.

.. _pages/tool/generator_config#valid_job_keys:

Valid Job Keys
==============

The value of each job is a map where the keys are **not** freely chooseable, but are predefined. 

Keys can be grouped into several categories:

* ``structure-changing`` - Keys that influence the configuration itself, e.g. the contents or structure of jobs, the job queue, or the config file as a whole (e.g. *extend, include (top-level), run*).
* ``actions`` - Keys that if present trigger a certain action in the generator, which usually results in some output (e.g. *compile, api, localize*).
* ``input/output-setting`` - Keys that specify input (e.g. classes or ranges of classes to deal with) and output (e.g. packaging, variants) options (e.g. *library, require, include*).
* ``runtime-settings`` - Keys pertaining to the working needs of the generator (e.g. *cache*).
* ``miscellaneous`` - Keys that don't fall in any of the other categories (e.g. *desc*).

First, here is an overview table, to list all possible keys in a job (if the key has a different context, this is explicitly noted). Below that, you'll find a structured listing of all possible configuration keys in their respective context, with links to further information for each.

.. list-table::
  :widths: 30 70

  * - **Action Keys**
    - **Description**                                                      
  * - api
    - Triggers the generation of a custom Apiviewer application.               
  * - clean-files
    - Delete files and directories from the file system.                       
  * - collect-environment-info
    - Prints various infos about the qooxdoo environment (version etc.)
  * - combine-images
    - Triggers creation of a combined image file that contains various images.  
  * - compile
    - Triggers the generation of a source or build version of the app.                 
  * - copy-files
    - Triggers files/directories to be copied.                                 
  * - copy-resources
    - Triggers the copying of resources.                                       
  * - fix-files
    - Fix white space in source files.                                         
  * - lint-check
    - Check source code with a lint-like utility.                              
  * - migrate-files
    - Migrate source code to the current qooxdoo version.                      
  * - pretty-print
    - Format source files.                                                     
  * - provider
    - Collects classes, resources and dependency info in a directory tree.
  * - shell
    - Triggers the execution of one or more external command(s).                          
  * - simulate
    - Triggers the execution of a suite of integration tests.
  * - slice-images
    - Triggers cutting images into regions.                                    
  * - translate
    - Triggers updating of .po files.                                          

  * - 
    - 

  * - **Structure-changing Keys**
    - **Description**

  * - default-job (top-level)
    - Default job to be run.
  * - export (top-level)
    - List of jobs to be exported to other config files.
  * - extend
    - Extend the current job with other jobs.
  * - include (top-level)
    - Include external config files.
  * - jobs (top-level)
    - Define jobs.
  * - let
    - Define macros.
  * - let (top-level)
    - Define default macros.
  * - run
    - Define a list of jobs to run.

  * -  
    -  

  * - **Input/Output-setting Keys**
    - **Description**                                      
  * - add-script
    - Includes aritrary URIs to be loaded by the app.
  * - asset-let
    - Defines macros that will be replaced in #asset hints.    
  * - compile-options
    - Various options that taylor the *compile* action.
  * - dependencies
    - Fine-tune dependency processing.                         
  * - exclude
    - Exclude classes from processing of the job.              
  * - include
    - Include classes to be processed in the job.              
  * - library
    - Define libraries to be taken into account for this job.  
  * - packages
    - Define packages for this app.                            
  * - require
    - Define prerequisite classes (load time).                 
  * - environment
    - Define key:value pairs for the app.
  * - use
    - Define prerequisite classes (run time).                  

  * -  
    -  

  * - **Runtime-setting Keys**
    - **Description**
  * - cache
    - Define the path to the cache directory.  
  * - config-warnings (experimental)
    - Suppress warnings relating to configuration.
  * - log
    - Tailor log output options.               

  * -  
    -  

  * - **Miscellaneous Keys**
    - **Description**                               
  * - desc
    - A descriptive string for the job.                 
  * - name (top-level)
    - A descriptive string for the configuration file.  

.. _pages/tool/generator_config#listing_of_keys_in_context:

Listing of Keys in Context
==========================

This shows the complete possible contents of the top-level configuration map. Further information is linked from the respective keys.

* :ref:`name <pages/tool/generator_config_ref#name>` A name or descriptive text for the configuration file.

* :ref:`include <pages/tool/generator_config_ref#include_top-level>` Include external config files. Takes a list of maps, where each map specifies an external configuration file, and options how to include it. (See special section on the :ref:`include key <pages/tool/generator_config_articles#include_key_top-level_-_adding_features>`)

* :ref:`let <pages/tool/generator_config_ref#let_top-level>` Define default macros. Takes a map (see the description of the job-level 'let' further down). This let map is included automatically into every job run. There is no explicit reference to it, so be aware of side effects.

* :ref:`export <pages/tool/generator_config_ref#export>` List of jobs to be exported if this config file is included by another.

* :ref:`default-job <pages/tool/generator_config_ref#default-job>` The name of a job to be run as default, i.e. when invoking the generator without job arguments.

* :ref:`config-warnings <pages/tool/generator_config_ref#config-warnings>` *(experimental)* Suppress warnings from configuration aspects which you know are ok.

* :ref:`jobs <pages/tool/generator_config_ref#jobs>` Map of jobs. Each key is the name of a job.

  * **<jobname>** Each job's value is a map describing the job. The describing map can have any number of the following keys:

    * :ref:`add-script <pages/tool/generator_config_ref#api>` A list of URIs that will be loaded first thing when the app starts.
    * :ref:`api <pages/tool/generator_config_ref#api>` Triggers the generation of a custom Apiviewer application.
    * :ref:`asset-let <pages/tool/generator_config_ref#asset-let>` Defines macros that will be replaced in #asset hints in source files. (See special section on the :ref:`"asset-let" key <pages/tool/generator_config_articles#asset-let_key>`).
    * :ref:`cache <pages/tool/generator_config_ref#cache>` Define the path to cache directories, most importantly to the compile cache. (See special section on the :ref:`pages/tool/generator_config_articles#cache_key` key).
    * :ref:`clean-files <pages/tool/generator_config_ref#clean-files>` Triggers clean-up of files and directories within a project and the framework, e.g. deletion of generated files, cache contents, etc.
    * :ref:`collect-environment-info <pages/tool/generator_config_ref#collect-environment-info>` Collects various information about the qooxdoo environment (like version, cache, etc.) and prints it to the console.
    * :ref:`combine-images <pages/tool/generator_config_ref#combine-images>` Triggers creation of a combined image file that contains various images.
    * :ref:`compile <pages/tool/generator_config_ref#compile>` Triggers the generation of a source or build version of the application.
    * :ref:`compile-options <pages/tool/generator_config_ref#compile-options>` Define various options that influence compile runs (both source and build version).
    * :ref:`config-warnings <pages/tool/generator_config_ref#config-warnings>` *(experimental)* Suppress warnings from configuration aspects which you know are ok.
    * :ref:`copy-files <pages/tool/generator_config_ref#copy-files>` Triggers files/directories to be copied, usually between source and build version.
    * :ref:`copy-resources <pages/tool/generator_config_ref#copy-resources>` Triggers the copying of resources, usually between source and build version.
    * :ref:`dependencies <pages/tool/generator_config_ref#dependencies>` Fine-tune the processing of class dependencies.
    * :ref:`desc <pages/tool/generator_config_ref#desc>` A string describing the job.
    * :ref:`environment <pages/tool/generator_config_ref#environment>` Define key:value pairs for the application, covering settings, variants and features.
    * :ref:`exclude <pages/tool/generator_config_ref#exclude>` List classes to be excluded from the job. Takes an array of class specifiers.
    * :ref:`extend <pages/tool/generator_config_ref#extend>` Extend the current job with other jobs. Takes an array of job names. The information of these jobs are merged into the current job description, so the current job sort of "inherits" their settings. (See the special section on :ref:`"extend" semantics <pages/tool/generator_config_articles#extend_key>`).
    * :ref:`fix-files <pages/tool/generator_config_ref#fix-files>` Fix white space in source files.
    * :ref:`include <pages/tool/generator_config_ref#include>` List classes to be processed in the job. Takes an array of class specifiers.
    * :ref:`let <pages/tool/generator_config_ref#let>` Define macros. Takes a map where each key defines a macro and the value its expansion. (See the special section on :ref:`macros <pages/tool/generator_config_articles#let_key>`).
    * :ref:`library <pages/tool/generator_config_ref#library>` Define libraries to be taken into account for this job. Takes an array of maps, each map specifying one library to consider. The most important part therein is the "manifest" specification. (See special section on :ref:`Manifest files <pages/tool/generator_config_articles#manifest_files>`).
    * :ref:`lint-check <pages/tool/generator_config_ref#lint-check>` Check source code with a lint-like utility.
    * :ref:`log <pages/tool/generator_config_ref#log>` Tailor log output of job.
    * :ref:`migrate-files <pages/tool/generator_config_ref#migrate-files>` Migrate source code to the current qooxdoo version.
    * :ref:`packages <pages/tool/generator_config_ref#packages>` Define packages for the application. (See special section on :ref:`packages <pages/tool/generator_config_articles#packages_key>`).
    * :ref:`pretty-print <pages/tool/generator_config_ref#pretty-print>` Triggers code beautification of source class files (in-place-editing). An empty map value triggers default formatting, but further keys can tailor the output.
    * :ref:`provider <pages/tool/generator_config_ref#provider>` Collects classes, resources and dependency information and puts them in a specific directory structure under the ``provider`` root.
    * :ref:`require <pages/tool/generator_config_ref#require>` Define prerequisite classes needed at load time. Takes a map, where the keys are class names and the values lists of prerequisite classes.
    * :ref:`run <pages/tool/generator_config_ref#run>` Define a list of jobs to run in place of the current job. (See the special section on :ref:`"run" semantics <pages/tool/generator_config_articles#run_key>`).
    * :ref:`shell <pages/tool/generator_config_ref#shell>` Triggers the execution of one or more external command(s).
    * :ref:`simulate <pages/tool/generator_config_ref#simulate>` Triggers the execution of a GUI test (simulated interaction) suite.
    * :ref:`slice-images <pages/tool/generator_config_ref#slice-images>` Triggers cutting images into regions.
    * :ref:`translate <pages/tool/generator_config_ref#translate>` Re-)generate .po files from source classes.
    * :ref:`use <pages/tool/generator_config_ref#use>` Define prerequisite classes needed at run time. Takes a map, where the keys are class names and the values lists of prerequisite classes.

