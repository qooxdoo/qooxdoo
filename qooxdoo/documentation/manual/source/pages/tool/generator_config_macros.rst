.. _pages/tool/generator_config_macros#configuration_macro_reference:

Configuration Macro Reference
*****************************

This page lists the macros which are pre-defined in qooxdoo, and can (mostly) be overridden in custom configuration files.

.. list-table::
   :header-rows: 1
   :widths: 40 40 20

   * - Macro name 
     - Description 
     - Default value
 
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
 
   * - LOCALES 
     - list of locales for this application 
     - [ "en" ] 
 
   * - OPTIMIZE 
     - list of optimization options for build version 
     - ["basecalls", "variables", "privates", "strings"] 
 
   * - QOOXDOO_PATH 
     - path to the qooxdoo installation root dir 
     - <undef> 
 
   * - QXICONTHEME 
     - icon theme to use for this application 
     - ["Tango"] 
 
   * - QXTHEME 
     - theme to use for this application 
     - "qx.theme.Modern" 
 
   * - ROOT 
     - application root dir (rel. to config dir) 
     - '.' 
 
   * - TEST_INCLUDE 
     - class pattern to search for test classes 
     - "${APPLICATION}.test.*" 
 
   * - TESTS_SCRIPT 
     - script file name for the test application (the "AUT") 
     - "tests.js" 
 
   * - TMPDIR 
     - (read-only) path to tmp directory 
     - (platform-dependent, like /tmp etc.) 
 
