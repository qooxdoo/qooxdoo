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
 
   * - HOME 
     - (read-only) value of the (process) environment variable "HOME"
     - "."
 
   * - LOCALES 
     - list of locales for this application 
     - [ "en" ] 
 
   * - OPTIMIZE 
     - list of optimization options for build version 
     - ["basecalls", "variables", "privates", "strings"] 
 
   * - QOOXDOO_PATH 
     - path to the qooxdoo installation root dir 
     - <undef> 
 
   * - QOOXDOO_VERSION 
     - the current qooxdoo version
     - %{version}
 
   * - QXICONTHEME 
     - icon theme to use for this application 
     - ["Tango"] 
 
   * - QXTHEME 
     - theme to use for this application 
     - "qx.theme.Modern" 
 
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
     - "${QOOXDOO_PATH}/component/simulator"

   * - TEST_INCLUDE 
     - class pattern to search for unit test classes 
     - "${APPLICATION}.test.*" 
 
   * - TESTS_SCRIPT 
     - script file name for the test application (the "AUT") 
     - "tests.js" 
 
   * - TMPDIR 
     - (read-only) path to tmp directory 
     - (platform-dependent, like /tmp etc.) 
 
   * - USERNAME 
     - (read-only) value of the (process) environment variable "USERNAME"
     - <undef>
 
