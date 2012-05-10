.. _pages/tool#tooling:

Tooling
*********

qooxdoo's tool chain comes with the SDK and comprises tools that help you create and maintain your %{JS} applications. They fall into two broad categories:

* command-line tools
* browser-based tools

Command-line tools are tools that run on your operating system's command shell, like *bash* for MacOSX and Linux, or *cmd* or *PowerShell* for Microsoft Windows. They generally require a Python installation on your system. Two important examples of this category are *create-application.py*, sort of an application wizard which you use to create a new application, and *generate.py* which you use during your development activities (and referred to as the "generator"), e.g. to build a running application from your source code.

Browser-based tools run in a web browser. Among them are the Apiviewer, which provides an interactive API reference, the Testrunner, which allows running your unit test in a GUI, or the Inspector, which allows to inspect the visual elements of your application and manipulate their properties.

As the browser-based applications are mostly described elsewhere, this section deals mainly with the command-line tools. It also provides a general introduction into the qooxdoo SDK and its structure.


Introduction
=============

.. toctree::
   :maxdepth: 1

   tool/sdk_introduction
   tool/sdk_requirements
   tool/getting_started
   tool/sdk_structure
   tool/application_structure
   tool/manifest
   tool/code_structure

Generator
=============

.. toctree::
   :maxdepth: 1

   tool/generator
   tool/generator_usage
   tool/generator_config
   tool/generator_optimizations
   tool/generator_config_articles
   tool/generator_config_background

Tutorials
------------

.. toctree::
   :maxdepth: 1

   tool/tutorial_basics

.. tool/generator_config_howto
.. :download:`Generator Cheat Sheet (PDF) <pages/tool/generator_cheat_sheet_1.0.0-1.pdf>`

References
------------
* :doc:`tool/generator_default_jobs`
* :doc:`tool/generator_config_ref`
* :doc:`tool/generator_config_macros`

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


Other Tools
====================

Some of the tools that come with the SDK are described elsewhere in this manual. Here are some pointers:

* :doc:`application/apiviewer`
* :doc:`development/frame_apps_testrunner`
* :doc:`application/inspector`
* :doc:`application/featureconfigeditor`
* :doc:`development/simulator`

