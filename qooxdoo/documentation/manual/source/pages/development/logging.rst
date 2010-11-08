.. _pages/logging#logging_system:

Logging System
**************

The logging API allows for a definition of what is logged and where it is logged, while trying to keep usage as simple as possible. 

.. _pages/logging#writing_log_messages:

Writing Log Messages
====================

Every qooxdoo object has four logging methods ``debug()``, ``info()``, ``warn()`` and ``error()``. Each method takes an arbitrary number of parameters which can be of any JavaScript data type: The logging system will create text representations of non-string parameters. 

The name of the method defines the log level your log message will get. If you want to log a message that is interesting for debugging, then use ``debug()``. If you want to log some general information, use ``info()``. If you want to log a warning, use ``warn()``. Errors should be logged with ``error()``. Have a look to the API documentation of the class ``qx.core.Object`` for more information.

So to write a log message just call:

::

    this.debug("Hello world");

Writing Custom Log Appenders
============================

qooxdoo's logging system is extensible by adding user-defined log appenders. These can be used in place of or in addition to qooxdoo's default appenders. A log appender is a static class with at least a "process" method.
This method will be called by the logger with an "entry" map as the only parameter.
Log appenders that need only a text representation of the logged item(s) can pass this map to ``qx.log.appender.Util.toText``. For other use cases, this is what an entry map consists of:

Log Entry Map
_____________

* *items* Array of maps containing information about the logged items, see below 
* *time* When the message was logged (JavaScript Date)
* *level* The level of the log message
* *object* qx object registry hash of the object the log method was called on
* *win* The application's DOM window (necessary for cross-frame logging)
* *offset* Time in milliseconds since application startup

Logged Item Map
_______________

* *text* Text representation of the logged item. If the logged item is an array, the value of *text* is an array containing text representations of each of the logged array's entries. For maps, the value is an array of maps with the following fields:

 * *key* The map key's name
 * *text* Representation of the corresponding value

* *trace* Stack trace (if the logged item is an Error object)
* *type* One of "undefined", "null", "boolean", "number", "string", "function", "array", "error", "map", "class", "instance", "node", "stringify", "unknown" "stringify"

Registering Appenders
_____________________

To register an appender named "custom.Logger" with qooxdoo's logging system, simply call 

::

    qx.log.Logger.register(custom.Logger)  