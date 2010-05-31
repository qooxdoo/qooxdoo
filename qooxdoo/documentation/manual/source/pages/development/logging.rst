.. _pages/logging#logging_system:

Logging System
**************

The logging API allows for a definition of what is logged and where it is logged, while trying to keep usage as simple as possible. The logging system in 1.2 should be easier to use than in the previous versions. 

.. _pages/logging#writing_log_messages:

Writing Log Messages
====================

Every qooxdoo object has four logging methods ``debug()``, ``info()``, ``warn()`` and ``error()``. Each method takes two parameters: The log message (String) and an error object (Error). The latter is optional.

The name of the method defines the log level your log message will get. If you want to log a message that is interesting for debugging, then use ``debug()``. If you want to log a general information, use ``info()``. If you want to log a warning, use ``warn()``. Errors should be logged with ``error()``. Have a look to the API documentation of the class ``qx.core.Object`` for more information.

So for writing a log message just call:

::

    this.debug("Hello world");

