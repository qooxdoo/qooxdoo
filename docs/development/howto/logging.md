# Logging System

The logging API allows for a definition of what is logged and where it is
logged, while trying to keep usage as simple as possible.

## Writing Log Messages

Every Qooxdoo object has four logging methods `debug()`, `info()`, `warn()` and
`error()`. Each method takes an arbitrary number of parameters which can be of
any JavaScript data type: The logging system will create text representations of
non-string parameters.

The name of the method defines the log level your log message will get. If you
want to log a message that is interesting for debugging, then use `debug()`. If
you want to log some general information, use `info()`. If you want to log a
warning, use `warn()`. Errors should be logged with `error()`.

So to write a log message just call:

```javascript
this.debug("Hello world");
```

All of [qx.core.Object](apps://apiviewer/#qx.core.Object) log methods delegates
to [qx.log.Logger](apps://apiviewer/#qx.log.Logger) . If you want to get into
more details, you can check their API.

Now that we know how to log a message, let's see where it's written.

## Log Appenders

Log appenders tells the logging system where to write log messages. When you
create a brand new Qooxdoo application, you may stumble upon this piece of code
in Application.js file.

```javascript
// Enable logging in debug variant
if (qx.core.Environment.get("qx.debug")) {
  qx.log.appender.Native;
  qx.log.appender.Console;
}
```

By default, every Qooxdoo application comes with 2 activated log appenders,
Native and Console.

The Native appender logs messages to the browser's console. For Firefox, that
native console might be Firebug Console, while for Chrome or Safari is the
Developer Tools' Console. The Console appender is a cross-browser solution,
logging messages to a top-left absolute positioned window that can be opened by
pressing F7.

Here's the complete list of appenders that Qooxdoo provides by default:

- [qx.log.appender.Native](apps://apiviewer/#qx.log.appender.Native)
- [qx.log.appender.Console](apps://apiviewer/#qx.log.appender.Console)
- [qx.log.appender.Element](apps://apiviewer/#qx.log.appender.Element)
- [qx.log.appender.PhoneGap](apps://apiviewer/#qx.log.appender.PhoneGap)
- [qx.log.appender.NodeConsole](apps://apiviewer/#qx.log.appender.NodeConsole)
- [qx.log.appender.RhinoConsole](apps://apiviewer/#qx.log.appender.RhinoConsole)

## Log Levels

As we have seen, there are four different types of log messages: 

1. debug
2. info
3. warn
4. error

You can control the number of log messages that are sent to the appenders
by setting the log level by `qx.log.Logger.setLevel("X")`, "X" being one
of the log level types. Higher log levels will suppress the lower types, i.e.
if you set the log level to "warn", messages of type "warn" and "error"
will be logged, but "info" and "debug" messages will be ignored. 

If the qooxdoo environment variable "qx.debug" is true, the log level will
be "debug", otherwise it will be "error" by default. 

## Filters

TBD.

## Writing Custom Log Appenders

If none of the default appenders are right for you, you
can also create a custom log appender. Writing your own
appenders is easy. Here's a blueprint to get you started.

```javascript
qx.Class.define("qx.log.appender.MyCustomAppender", {
  statics: {
    init() {
      // register to log engine
      qx.log.Logger.register(this);
    },

    process(entry) {
      //handle the entry map
    }
  }
});
```

As you can see, an appender is just a static class that implements a "process"
method, and register itself to the logging system.

The process method will be called by the logger with an "entry" map as the only
parameter. Log appenders that need only a text representation of the logged
item(s) can pass this map to `qx.log.appender.Util.toText`. For other use cases,
this is what an entry map consists of:

### Log Entry Map

- _items_ Array of maps containing information about the logged items, see below
- _time_ When the message was logged appender is a static class with at
  (JavaScript Date)
- _level_ The level of the log message
- _object_ qx object registry hash of the object the log method was called on
- _win_ The application's DOM window (necessary for cross-frame logging)
- _offset_ Time in milliseconds since application startup

### Logged Item Map

- **text**: Text representation of the logged item. If the logged item is an array,
  the value of _text_ is an array containing text representations of each of the
  logged array's entries. For maps, the value is an array of maps with the
  following fields:
  
  -   **key**: The map key's name
  -   **text**: Representation of the corresponding value
  
- **trace**: Stack trace (if the logged item is an Error object)

- **type**: One of "undefined", "null", "boolean", "number", "string", "function",
  "array", "error", "map", "class", "instance", "node", "stringify", "unknown"
  "stringify"
