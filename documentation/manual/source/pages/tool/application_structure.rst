.. _pages/application_structure#application_structure:

Application Structure
*********************

.. _pages/application_structure#structural_overview:

Structural Overview
===================

A qooxdoo application has a well-organized file structure. For an application named ``custom``, everything is located within the application folder ``custom``. Indentation denotes file system nesting:

* ``source`` - this folder always exists, as it contains the :ref:`development version <pages/getting_started/helloworld#run_your_application>` of your app

  * ``index.html`` - usually the only HTML file a qooxdoo application needs. Typically it hardly includes any markup, as the entire qooxdoo application is available as an external JavaScript file
  * ``class`` - all JavaScript classes

    * ``custom`` - this is the top-level namespace of your classes, often identical to the application name
  * ``resource`` - any static resources like images, etc. belong into this folder

    * ``custom`` - resource handling requires all files to be organized in folders that correspond to namespaces. Typically, the resources of your app are stored in a folder of the same name as the top-level namespace of your application classes

      * ``test.png`` - sample resource

  * ``script`` - this folder is created and/or updated for each development version of your app when executing ``generate.py source`` (or one of the other *source-** jobs)

    * ``custom.js`` - this JavaScript file is included from ``index.html``. It is a loader script that includes all required files one-by-one.

  * ``translation`` - if you choose to develop your app for multiple languages, translation files will be put into this directory

    * ``en.po`` - and the other ``.po`` files for the languages your app supports. The respective locale is used as a file name, e.g. ``it.po``, ``pt_BR.po``, etc.


* ``build`` - this folder is created and/or updated for each :ref:`deployment version <pages/getting_started/helloworld#deployment>` of your app using ``generate.py build``

  * ``index.html`` - identical to the one of the ``source`` version
  * ``script`` - contains the generated JavaScript code of your application

    * ``custom.js`` - this JavaScript file is included from ``index.html``. In the *build* version this file contains the loader plus %{JS} code your application requires, in a compressed and optimized form. If you are developing a large-scale application, you can split it into so-called parts that can be loaded on demand.

  * ``resource`` - if your application classes contain appropriate :ref:`compiler hints <pages/code_structure#details>`, those resources are automatically copied to this target folder. Your application is then self-contained and may be transferred to an external hosting environment.


* ``api`` - contains a searchable :ref:`API viewer <pages/getting_started/helloworld#api_reference>` specific to your application, created by running the command ``generate.py api``. As it is self-consistent, it may be copied anywhere and run offline.
* ``test`` - a standalone :ref:`Test runner <pages/getting_started/helloworld#unit_testing>` for unit tests you may create for your app, created by running ``generate.py test``.
* :doc:`Manifest.json <manifest>` - every qooxdoo app has such a Manifest file for some meta information
* :doc:`config.json </pages/tool/generator_config>` - configuration file for the build process and all other integrated developer tools
* :ref:`pages/tool/generator_usage#generate.py` - use this script for all kinds of tasks and tools, most importantly to generate the development and the deployment versions of your app.

.. _pages/application_structure#in_other_words:

Description
==============

Here is a bit more prose regarding this structure. Of the basic structure, every application/library must contain a *config.json* and a *Manifest.json* file in its top-level directory (In theory, you can deviate from this rule, but it's much easier to stick with it). From this directory, a *source/class* subdirectory is expected, which contains a name space subdirectory and some class files therein. All other subdirectories in the top directory are then created during generator runs ('build', 'api', 'test', ...).

The most important of these sudirectories is of course *source* since it contains your source code. Aside from the *class/<name space>* subdirectory it has to have a *resource* subdir (for icons, style files, flash files, etc.) and a *translation* subdir (for string translation files). All these are mandatory, but might be empty. During a *'generate.py source'* a *source/script* directory is created which contains the generator output (basically a Javascript file that references all necessary class files, icons, etc.). This one has to be referenced from the application's index.html (usually *source/index.html*).

The *build* dir (created with *'generate.py build'*) has a very similar structure as the *source* dir, with *script*, and *resource* subdirs. The main difference is that everything that is necessary for your application to run is copied under this common root, and that the generator output script(s) in *build/script* contains the actual class definitions, not just references to their source files. The *build* dir is therefore self-contained, and doesn't have references that point outside of it.

Create some vanilla skeleton apps with :ref:`create-application.py <pages/getting_started/helloworld#create_your_application>` located in `tool/bin` and look at their initial file structure, to get a feel for it. Tailor the *source/class/<namespace>/Application.js* as the main application class, add further classes to your needs, and let the tool chain take care of the rest. You will have to run ``generate.py source`` initially  and whenever you use further classes in your code. You can try out your app by opening *source/index.html* directly in your browser. You simply reload to see changes in the code. If you are comfortable with that, run a ``generate.py build`` and open *build/index.html* in your browser. If that is fine, copy the whole ``build`` tree to your web server.

