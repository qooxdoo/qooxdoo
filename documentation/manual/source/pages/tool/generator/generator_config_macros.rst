.. _pages/tool/generator/generator_config_macros#configuration_macro_reference:

Generator Config Macros
******************************

This page lists the macros which are pre-defined in qooxdoo, and can (mostly) be overridden in custom configuration files. (Others, like PYTHON_CMD or QOOXDOO_VERSION, you would only want to reference, but not set).

.. list-table::
    :header-rows: 1
    :widths: 40 40 20

    * - Macro name
      - Description
      - Default value

    * - .. _pages/tool/generator/generator_config_macros#add_nocache_param:

        ADD_NOCACHE_PARAM
      - turn :ref:`compile-options/uris/add-nocache-param <pages/tool/generator/generator_config_ref#compile-options>`  on/off for *source* builds
      - false
    * - .. _pages/tool/generator/generator_config_macros#api_exclude:

        API_EXCLUDE
      - list of class pattern to exclude from the api documentation
      - []

    * - .. _pages/tool/generator/generator_config_macros#api_include:

        API_INCLUDE
      - list of class pattern to include in the api documentation
      - ["qx.*", "${APPLICATION}.*"]

    * - .. _pages/tool/generator/generator_config_macros#application:

        APPLICATION
      - application name space
      - <undef>

    * - .. _pages/tool/generator/generator_config_macros#application_main_class:

        APPLICATION_MAIN_CLASS
      - application main class
      - ${APPLICATION}.Application

    * - .. _pages/tool/generator/generator_config_macros#build_path:

        BUILD_PATH
      - output path for the "build" job (can be rel. to config dir)
      - ./build

    * - .. _pages/tool/generator/generator_config_macros#cache:

        CACHE
      - path to the compile cache (can be rel. to config dir)
      - ${TMPDIR}/cache

    * - .. _pages/tool/generator/generator_config_macros#cache_key:

        CACHE_KEY
      - takes the value of a complete :ref:`cache <pages/tool/generator/generator_config_ref#cache>` configuration key (i.e. a map)
      - { "compile" : "${CACHE}", "downloads" : "${CACHE}/downloads", "invalidate-on-tool-change" : true }

    * - .. _pages/tool/generator/generator_config_macros#compile_with_lint:

        COMPILE_WITH_LINT
      - turn :ref:`lint-check <pages/tool/generator/generator_config_ref#compile-options>` on/off during compile runs
      - true

    * - .. _pages/tool/generator/generator_config_macros#generator_opts:

        GENERATOR_OPTS
      - (read-only) string with the command line options the generator was invoked with (e.g. *"-c myconf.json -q"*)
      - <undef>

    * - .. _pages/tool/generator/generator_config_macros#home:

        HOME
      - (read-only) value of the (process) environment variable "HOME"
      - "." *(for safety reasons)*

    * - .. _pages/tool/generator/generator_config_macros#locales:

        LOCALES
      - list of locales for this application
      - [ "en" ]

    * - .. _pages/tool/generator/generator_config_macros#optimize:

        OPTIMIZE
      - list of :doc:`optimization options
        </pages/tool/generator/generator_optimizations>` for build version
      - ["basecalls", "comments", "privates", "statics", "strings", "variables", "variants", "whitespace"]

    * - .. _pages/tool/generator/generator_config_macros#qooxdoo_path:

        QOOXDOO_PATH
      - path to the qooxdoo installation root dir
      - <undef>

    * - .. _pages/tool/generator/generator_config_macros#qooxdoo_version:

        QOOXDOO_VERSION
      - the current qooxdoo version
      - %{version}

    * - .. _pages/tool/generator/generator_config_macros#qooxdoo_revision:

        QOOXDOO_REVISION
      - (read-only) the current qooxdoo repository revision
      - (only defined in a repository checkout)

    * - .. _pages/tool/generator/generator_config_macros#qxicontheme:

        QXICONTHEME
      - icon theme to use for this application
      - ["Tango"]

    * - .. _pages/tool/generator/generator_config_macros#qxtheme:

        QXTHEME
      - theme to use for this application
      - "qx.theme.Modern"

    * - .. _pages/tool/generator/generator_config_macros#python_cmd:

        PYTHON_CMD
      - (read-only) Python executable
      - (your system's default Python executable)

    * - .. _pages/tool/generator/generator_config_macros#root:

        ROOT
      - application root dir (rel. to config dir)
      - "."

    * - .. _pages/tool/generator/generator_config_macros#simulation_include:

        SIMULATION_INCLUDE
      - class pattern to search for GUI test classes (deprecated)
      - "${APPLICATION}.simulation.*"

    * - .. _pages/tool/generator/generator_config_macros#simulator_classpath:

        SIMULATOR_CLASSPATH
      - Java classpath argument for GUI test runner
      - "${SIMULATOR_ROOT}/tool/js.jar: ${SIMULATOR_ROOT}/tool/selenium-java-client-driver.jar"

    * - .. _pages/tool/generator/generator_config_macros#simulator_root:

        SIMULATOR_ROOT
      - path to the framework's simulator component
      - "${QOOXDOO_PATH}/ component/ simulator"

    * - .. _pages/tool/generator/generator_config_macros#source_server_port:

        SOURCE_SERVER_PORT
      - port the :ref:`pages/tool/generator/generator_default_jobs#source-server` should run on
      - 0 (meaning an arbitrary free port will be picked)

    * - .. _pages/tool/generator/generator_config_macros#test_include:

        TEST_INCLUDE
      - class pattern to search for unit test classes
      - "${APPLICATION}.test.*"

    * - .. _pages/tool/generator/generator_config_macros#test_exclude:

        TEST_EXCLUDE
      - class pattern to exclude unit test classes
      - "${APPLICATION}.test.oldtests.*"

    * - .. _pages/tool/generator/generator_config_macros#test_script:

        TESTS_SCRIPT
      - script file name for the test application (the "AUT")
      - "tests.js"

    * - .. _pages/tool/generator/generator_config_macros#tmpdir:

        TMPDIR
      - (read-only) path to tmp directory
      - (platform-dependent, like /tmp etc.; run *generate.py info* to find out)

    * - .. _pages/tool/generator/generator_config_macros#username:

        USERNAME
      - (read-only) value of the (process) environment variable "USERNAME"
      - <undef>

