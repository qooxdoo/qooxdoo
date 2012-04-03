
.. _pages/tool/create_application#create_application:

Create Application
******************

There is a command-line tool from the *tool/bin* directory named ``create-application.py`` that helps you start a new application or library. It basically creates a folder structure with some essential files filled in. This basic setup already comprises a minimal working application which you can build and run, with no changes. But of course the intention is that you then go ahead and change the files' contents, particularly the %{JS} source files, add new classes, and evolve this skeleton into your desired application.

The same file structure is suitable to hold a library, i.e. a set of classes that you want to reuse in several applications. You can even have libraries that only hold images or other static resources, like CSS files.

You start it at the command prompt. The minimal set of options you have to provide is an output folder name (*-n*), and optionally an application type (*-t*). Other options let you select an output directory, a different application namespace, or a log file.

Here is a simple example:

.. code-block:: bash

   $ create-application.py -n foo -t native

Several tutorials in this manual make use of *create-application.py*, e.g. the :doc:`getting_started` tutorial. There is also a dedicated page that describes the :doc:`various application types </pages/development/skeletons>`.

For the most current information about the options please refer to the interactive help you get with ``create-application.py --help``. Here is a sample capture:

.. code-block:: none

    $ create-application.py --help
    Usage: create-application.py --name APPLICATIONNAME [--out DIRECTORY]
                                 [--namespace NAMESPACE] [--type TYPE]
                                 [-logfile LOGFILE] [--skeleton-path PATH]

    Script to create a new qooxdoo application.

    Example: For creating a regular GUI application 'myapp' you could execute:
      create-application.py --name myapp

    Options:
      -h, --help            show this help message and exit
      -n APPLICATIONNAME, --name=APPLICATIONNAME
                            Name of the application. An application folder with
                            identical name will be created. (Required)
      -o DIRECTORY, --out=DIRECTORY
                            Output directory for the application folder. (Default:
                            .)
      -s NAMESPACE, --namespace=NAMESPACE
                            Applications's top-level namespace. (Default:
                            APPLICATIONNAME)
      -t TYPE, --type=TYPE  Type of the application to create, one of: ['basic',
                            'bom', 'contribution', 'gui', 'inline', 'mobile',
                            'native'].'basic' -- for non-browser run times like
                            Rhino, node.js; 'bom' -- can be used to build low-
                            level qooxdoo applications; 'contribution' -- is
                            suitable for qooxdoo-contrib ; 'gui' -- is a standard
                            qooxdoo GUI application; 'inline' -- is an inline
                            qooxdoo GUI application; 'mobile' -- is a qooxdoo
                            mobile application with full OO support and mobile GUI
                            classes; 'native' -- is a qooxdoo application with
                            full OO support but no GUI classes. (Default: gui)
      -l LOGFILE, --logfile=LOGFILE
                            Log file
      -p PATH, --skeleton-path=PATH
                            (Advanced) Path where the script looks for skeletons.
                            The directory must contain sub directories named by
                            the application types. (Default:
                            /home/thron7/workspace/qooxdoo.git/component/skeleton)
      --cache=PATH          Path to the cache directory; will be entered into
                            config.json's CACHE macro (Default:
                            ${TMPDIR}/qx${QOOXDOO_VERSION}/cache)

