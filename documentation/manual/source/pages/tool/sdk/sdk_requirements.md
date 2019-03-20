SDK Requirements
================

%{qooxdoo} offers a platform-independent and user-friendly tool chain, in form of an SDK. It comes with the /pages/desktop and /pages/mobile downloads. For those components you use it for *creating and developing* a %{qooxdoo} application. It is not needed for *running* the application. For the /pages/website and /pages/server components there are pre-build libraries to download, so you don't need the SDK.

Python
------

The tool chain only requires a [Python](http://www.python.org) installation. Use a standard **Python 2.x** release, version 2.6 or above. Python 3 is currently [not supported](http://%{qooxdoo}.org/docs/general/python_3_support). (If in doubt you can query the version of your local Python installation by running the command `python -V`). As a %{qooxdoo} user you do not need any Python knowledge, it is merely a technology used internally for the tools. Python comes either pre-installed on many systems or it can be installed very easily:

### ![image0](/_static/windows.png) Windows

It is trivial! Just download and install the excellent [ActivePython](http://www.activestate.com/activepython/downloads) package. Its default settings of the installation wizard are fine, there is nothing to configure. You can as well use the Windows package from [Python.org](http://www.python.org/download/releases/2.7/), but this might require additional manual configuration \<pages/troubleshooting\#windows\>.

#### Windows Shells Interop

A word concerning various shells available under Windows and how they interoperate. We are testing the SDK with [Windows cmd](http://en.wikipedia.org/wiki/Command_Prompt) and occasionally [PowerShell](http://en.wikipedia.org/wiki/PowerShell). Both should work equally well, and you should be able to freely switch between them (e.g. running *create-application.py* in cmd shell, and then change to PowerShell and run *generate.py source* in the skeleton, or vice versa).

If you mix your development efforts between native Windows shells and Cygwin (see next section), things will get more complicated. While working entirely under Cygwin should incur no problems (apart from being slower than under a native Windows setup), even when using a Windows installation of Python, creating an application with Cygwin and then building it with cmd or the other way round might or might not work as expected.

Other environments are available on Windows that provide a command shell, like [MinGW](http://en.wikipedia.org/wiki/MinGW) and [git bash](https://help.github.com/articles/set-up-git#platform-windows) . The latter has seen increased popularity with the growing distribution of the [Git](http://en.wikipedia.org/wiki/Git_(software)) version control system. We would not recommend mixing SDK usage with git bash, as it (at the time of checking) uses a file system interface that is neither like Windows nor Cygwin (but rather reminiscent of an old Cygwin interface, using drive letters and forward slashes like `c:/foo/bar`). It's unclear whether using only git bash would work for qooxdoo projects, and we wouldn't be able to provide support for any issues that might arise.

### ![image1](/_static/cygwin.png) Cygwin

[Cygwin](http://www.cygwin.com/) can be used as an optional free and powerful Unix-like environment for Windows. You won't need a native Python installation, just make sure to include Cygwin's **built-in** Python as an additional package when using Cygwin's [setup program](http://cygwin.com/install.html).

### ![image2](/_static/macosx.png) Mac

Python is **pre-installed** on Max OS X. No additional software needs to be installed, but on older systems it might need an update.

### ![image3](/_static/linux.png) Linux

Python often comes **pre-installed** with your favorite distribution, just make sure they're still using a Python 2.x version. If not, simply use your package manager to install a suitable package.

Disk Space
----------

The unpacked SDK will require around **%{sdk\_unpacked} MB** disk space (a big part of this is due to media files like images).

During runtime the tool chain also uses a subdirectory in your system's `TMP` path, to cache intermediate results and downloaded files. Depending on your activities this cache directory can become between **%{cache\_average\_min}** and **%{cache\_average\_max} GB** in size. If the [default cache path](http://%{qooxdoo}.org/docs/general/snippets#finding_your_system-wide_tmp_directory) does not suite you, you can change it in your configuration.

Installation and Setup
----------------------

Installation of the SDK is just going to the [download section](http://%{qooxdoo}.org/downloads) and grab the package suitable for your purpose. Choose either the *Desktop* or *Mobile* download, which both come as an SDK archive. Unzip it to a suitable path on your hard disk. The archive contains a single top-level folder, which in turn contains all the SDK's files and sub-folders.

This is all as far as the SDK is concerned. As an additional convenience you might want to add the `<sdk-root-path>/tool/bin` directory to your system environment `PATH` variable. This is a prerequisite for invoking the executable programs of the tool chain without the need to address them with their path.

Installation Troubleshooting
----------------------------
