.. _pages/troubleshooting#troubleshooting:

SDK Installation Troubleshooting
**********************************

Python Installation
===================

.. _pages/troubleshooting#python_3.0:

Python 3.0
----------

Please make sure that you use a regular **Python 2.x** release (v2.5 or above). 
**Python 3.0 is currently not supported**.

Execute ``python -V`` in a console to get the installed Python version.

.. _pages/troubleshooting#windows:

Windows
-------

.. _pages/troubleshooting#making_interpreter_available:

Making the interpreter available
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. note::

    The following is only required when installing the Windows package from `Python.org <http://python.org>`_. When installing the preferred `ActivePython <http://www.activestate.com/activepython/downloads>`_ this installation step is conveniently handled within its graphical installation wizard.


After your successful :ref:`Python installation <pages/tool/requirements#python>`, you need to add the installation folder to the so-called ``PATH`` environment variable, which contains a list of directories that are searched for executables. 

Suppose you installed Python to its default location ``C:\Python26``, open a Windows command shell (choose menu ``Start -> Run...`` and type ``cmd``). The following command prepends the installation folder to the value of ``PATH``, separated by a semicolon:

::

    set PATH=C:\Python26;%PATH%

When you now execute ``python -V``, it should print out its version number.

The modification of the ``PATH`` variable as described above is only *temporary*. In order not to repeat the command each time you open a new command shell, modify the ``PATH`` variable permanently: in ``Start -> Preferences -> System`` choose ``Environment variables`` under the ``Advanced`` tab. Edit the system variable ``Path`` by prepending ``C:\Python26;``.

.. _pages/troubleshooting#file_association:

File association
^^^^^^^^^^^^^^^^

.. note::

    The following is only required when installing the Windows package from `Python.org <http://python.org>`_. When installing the preferred `ActivePython`_ this installation step is conveniently handled within its graphical installation wizard.


In a standard Python installation on Windows, the ``.py`` file extension gets associated with the Python interpreter. This allows you to invoke .py files directly. You can check that in the following way at a command prompt:

::

    C:\>assoc .py
    .py=Python.File

If this doesn't work, you can add a file association through ``Windows Explorer -> Extras -> Folder Options -> File Types``.

If for any reason you cannot use a file association for .py files, you can still invoke the Python interpreter directly, passing the original command line as arguments. In this case, make sure to provide a path prefix for the script name, even for scripts in the same directory, like so (this will be fixed later):

::

    python ./generate.py source

.. _pages/troubleshooting#windows_vista:

Windows Vista
-------------

To run qooxdoo's Python-based tools without problems, it is important to have Python installed as an administrator "for all" users.  

Administrators installing Python "for all" users on Windows Vista *either* need to be logged in as user ``Administrator``, *or* use the runas command, as in:

::

    runas /user:Administrator "msiexec /i <path>\<file>.msi"

.. _pages/troubleshooting#windows_7:

Windows 7
---------

It has been reported that you need to use the PowerShell that comes with Windows 7 for the tools to work properly. The simple command shell doesn't seem to be sufficient. To launch the PowerShell, hit the *WIN+R* keys and enter ``powershell``.

.. _pages/troubleshooting#mac_os_x:

Mac OS X
--------

Older Macs (e.g. 10.4) may need an update of the pre-installed Python. See the following comment from the `Python on Mac page <http://www.python.org/download/mac/>`_ :
"Python comes pre-installed on Mac OS X, but due to Apple's release cycle, it's often one or even two years old. The overwhelming recommendation of the "MacPython" community is to upgrade your Python by downloading and installing a newer version from `the Python standard release page <http://www.python.org/download/releases/>`_."

If the generator is very slow on your Mac, it may be due to Spotlight or more precisely it's indexing daemon ``mds``. ``mds`` can end up in an infinite loop resulting in very high disk load. While this is a general Mac issue, the generator can trigger this behaviour. To end the infinite loop:

::

  # Delete Spotlight cache
  sudo rm -r /.Spotlight-V100
