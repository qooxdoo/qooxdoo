.. _pages/tool#tooling:

Tooling
*********

qooxdoo's tool chain comes with the SDK and comprises tools that help you
create and maintain your %{JS} applications. They fall into two broad
categories:

* command-line tools
* browser-based tools

Command-line tools are tools that run on your operating system's command shell,
like *bash* for MacOSX and Linux, or *cmd* or *PowerShell* for Microsoft
Windows. They generally require a Python installation on your system. Two
important examples of this category are *create-application.py*, sort of an
application wizard which you use to create a new application, and *generate.py*
which you use during your development activities (and referred to as the
"generator"), e.g. to build a running application from your source code.

Browser-based tools run in a web browser. Among them are the Apiviewer, which
provides an interactive API reference, the Testrunner, which allows running
your unit test in a GUI, or the Inspector, which allows to inspect the visual
elements of your application and manipulate their properties.

As the browser-based applications are mostly described elsewhere, this section
deals mainly with the command-line tools. It also provides a general
introduction into the qooxdoo SDK and its structure.


Introduction
=============

.. toctree::
   :maxdepth: 1

   tool/sdk/sdk_introduction
   tool/sdk/sdk_requirements
   tool/getting_started
   tool/sdk/sdk_structure
   tool/sdk/application_structure
   tool/sdk/manifest
   tool/sdk/code_structure

Generator
=============

.. toctree::
   :maxdepth: 1

   tool/generator/generator
   tool/generator/features
   tool/generator/generator_usage
   tool/generator/generator_optimizations
   tool/generator/dependencies_manually

Configuration
--------------

.. toctree::
   :maxdepth: 1

   tool/generator/generator_config
   tool/generator/config_usage
   tool/generator/config_tweaking
   tool/generator/generator_config_articles
   tool/generator/config_branching
   tool/generator/generator_config_background

Tutorials
------------

.. toctree::
   :maxdepth: 1

   tool/tutorial_basics

.. tool/generator/generator_config_howto

.. _pages/tool#references:

References
------------
* :doc:`tool/generator/default_jobs_actions`
* :doc:`tool/generator/default_jobs_includers`
* :doc:`tool/generator/generator_config_ref`
* :doc:`tool/generator/generator_config_macros`

Grunt
=====

.. toctree::
   :maxdepth: 1

   tool/grunt

Lint
=============

Tutorials
------------

.. toctree::
   :maxdepth: 1

   Source code validation <tool/source_code_validation>


Application Wizard
===================

.. toctree::
   :maxdepth: 1

   tool/create_application


Migration
==========

.. toctree::
   :maxdepth: 1

   tool/migration/migration_guide

Other Tools
====================

Some of the tools that come with the SDK are described elsewhere in this
manual. Here are some pointers:

* :doc:`application/apiviewer`
* :doc:`development/frame_apps_testrunner`
* :doc:`application/inspector`
* :doc:`application/featureconfigeditor`
* :doc:`development/simulator`

