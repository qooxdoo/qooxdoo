.. _pages/tool/generator_config_macros#configuration_macro_reference:

Generator Config Macros
******************************

This page lists the macros which are pre-defined in qooxdoo, and can (mostly) be overridden in custom configuration files. (Others, like PYTHON_CMD or QOOXDOO_VERSION, you would only want to reference, but not set).

.. list-table::
    :header-rows: 1
    :widths: 40 40 20

    * - Macro name 
      - Description 
      - Default value
  
    * - ADD_NOCACHE_PARAM
      - turn :ref:`compile-options/uris/add-nocache-param <pages/tool/generator_config_ref#compile-options>`  on/off for *source* builds
      - false
    * - API_EXCLUDE 
      - list of class pattern to exclude from the api documentation
      - []
  
    * - API_INCLUDE 
      - list of class pattern to include in the api documentation
      - ["qx.*", "${APPLICATION}.*"]
  
    * - APPLICATION
      - application name space
      - <undef>
  
    * - APPLICATION_MAIN_CLASS 
      - application main class 
      - ${APPLICATION}.Application 
  
    * - BUILD_PATH 
      - output path for the "build" job (can be rel. to config dir) 
      - ./build 
  
    * - CACHE 
      - path to the compile cache (can be rel. to config dir) 
      - ${TMPDIR}/cache 
  
    * - CACHE_KEY
      - takes the value of a complete :ref:`cache <pages/tool/generator_config_ref#cache>` configuration key (i.e. a map)
      - { "compile" : "${CACHE}", "downloads" : "${CACHE}/downloads", "invalidate-on-tool-change" : true }
  
    * - GENERATOR_OPTS
      - *(experimental)* (read-only) string with the command line options the generator was invoked with (e.g. *"-c myconf.json -q"*)
      - <undef>
      
    * - HOME 
      - (read-only) value of the (process) environment variable "HOME"
      - "." *(for safety reasons)*
  
    * - LOCALES 
      - list of locales for this application 
      - [ "en" ] 
  
    * - OPTIMIZE 
      - list of :ref:`optimization options <pages/tool/generator_config_ref#compile-options>` for build version 
      - ["basecalls", "comments", "privates", "strings", "variables", "variants", "whitespace"]
  
    * - QOOXDOO_PATH 
      - path to the qooxdoo installation root dir 
      - <undef> 
  
    * - QOOXDOO_VERSION 
      - the current qooxdoo version
      - %{version}
  
    * - QOOXDOO_REVISION 
      - (read-only) the current qooxdoo repository revision
      - (only defined in a repository checkout)
  
    * - QXICONTHEME 
      - icon theme to use for this application 
      - ["Tango"] 
  
    * - QXTHEME 
      - theme to use for this application 
      - "qx.theme.Modern" 
  
    * - PYTHON_CMD 
      - (read-only) Python executable
      - (your system's default Python executable)
      
    * - ROOT 
      - application root dir (rel. to config dir) 
      - "."
      
    * - SIMULATION_INCLUDE
      - class pattern to search for GUI test classes 
      - "${APPLICATION}.simulation.*"
  
    * - SIMULATOR_CLASSPATH
      - Java classpath argument for GUI test runner
      - "${SIMULATOR_ROOT}/tool/js.jar: ${SIMULATOR_ROOT}/tool/selenium-java-client-driver.jar"

    * - SIMULATOR_ROOT
      - path to the framework's simulator component
      - "${QOOXDOO_PATH}/ component/ simulator"

    * - TEST_INCLUDE 
      - class pattern to search for unit test classes 
      - "${APPLICATION}.test.*"
  
    * - TEST_EXCLUDE
      - class pattern to exclude unit test classes 
      - "${APPLICATION}.test.oldtests.*"

    * - TESTS_SCRIPT 
      - script file name for the test application (the "AUT") 
      - "tests.js" 
  
    * - TMPDIR 
      - (read-only) path to tmp directory 
      - (platform-dependent, like /tmp etc.; run *generate.py info* to find out) 
  
    * - USERNAME 
      - (read-only) value of the (process) environment variable "USERNAME"
      - <undef>
  
