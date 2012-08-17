Migration Data
***************

*(status: Skeleton)*

This section deals with creating and maintaining migration data, usually found under ``tool/data/migration``.

Folder Structure
=================

* Version number
* ``info`` and ``patch``
* Necessary for every release?
* Adaption to tool/bin/migrator.py

Regex Targeting %{JS} Code
===========================================

Info Files
----------------

* How they are processed
* File syntax

Patch Files
----------------

* How they are processed
* File syntax: regex, '=', escape '=', groups and replacement \1, \2, etc.
* Tests?

Python Scripts Targeting %{JS} Code
======================================================

There is the possibility to use a Python script that works on the syntax tree of a source file, in order to obtain more complicated re-writes than could be achieved with regex's.

Python Scripts Targeting Configuration Files
===============================================

* The basic logic for migrating configuration files is implemented.
* The main missing thing is the handling of '=' (don't overwrite) sigils in config keys. It is unclear how they should be handled in a concreate config if the corresponding key is to be moved or renamed.

How to do it
--------------

* Copy ``config.py`` from ``tool/data/migration/1.6`` folder to the current version folder. If unchanged, it does nothing so the copy is harmless.
* Read the comments in the file and fill out the indicated data structures and functions. Only then will the script be active when a ``generate.py migration`` is run.
