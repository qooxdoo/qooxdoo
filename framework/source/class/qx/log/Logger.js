/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Main qooxdoo logging class.
 *
 * Used as central logging feature by qx.core.Object.
 *
 * Extremely modular and lightweight to support logging at bootstrap and
 * at shutdown as well.
 *
 * * Supports dynamic appenders to push the output to the user
 * * Supports buffering of the last 50 messages (configurable)
 * * Supports different debug levels ("debug", "info", "warn" or "error")
 * * Simple data serialization for incoming messages
 */
/*
 #require(qx.dev.StackTrace)
 */
qx.Class.define("qx.log.Logger",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CONFIGURATION
    ---------------------------------------------------------------------------
    */

    __level : "debug",


    /**
     * Configures the minimum log level required for new messages.
     *
     * @param value {String} One of "debug", "info", "warn" or "error".
     * @return {void}
     */
    setLevel : function(value) {
      this.__level = value;
    },


    /**
     * Returns the currently configured minimum log level required for new
     * messages.
     *
     * @return {Integer} Debug level
     */
    getLevel : function() {
      return this.__level;
    },


    /**
     * Configures the number of messages to be kept in the buffer.
     *
     * @param value {Integer} Any positive integer
     * @return {void}
     */
    setTreshold : function(value) {
      this.__buffer.setMaxMessages(value);
    },


    /**
     * Returns the currently configured number of messages to be kept in the
     * buffer.
     *
     * @return {Integer} Treshold value
     */
    getTreshold : function() {
      return this.__buffer.getMaxMessages();
    },





    /*
    ---------------------------------------------------------------------------
      APPENDER MANAGEMENT
    ---------------------------------------------------------------------------
    */

    /** {Map} Map of all known appenders by ID */
    __appender : {},


    /** {Integer} Last free appender ID */
    __id : 0,


    /**
     * Registers the given appender and inserts the last cached messages.
     *
     * @param appender {Class} A static appender class supporting at
     *   least a <code>process()</code> method to handle incoming messages.
     * @return {void}
     */
    register : function(appender)
    {
      if (appender.$$id) {
        return;
      }

      // Register appender
      var id = this.__id++;
      this.__appender[id] = appender;
      appender.$$id = id;
      var levels = this.__levels;

      // Insert previous messages
      var entries = this.__buffer.getAllLogEvents();
      for (var i=0, l=entries.length; i<l; i++) {
        if (levels[entries[i].level] >= levels[this.__level]) {
          appender.process(entries[i]);
        }
      }
    },


    /**
     * Unregisters the given appender
     *
     * @param appender {Class} A static appender class
     * @return {void}
     */
    unregister : function(appender)
    {
      var id = appender.$$id;
      if (id == null) {
        return;
      }

      delete this.__appender[id];
      delete appender.$$id;
    },





    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Sending a message at level "debug" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    debug : function(object, message) {
      qx.log.Logger.__log("debug", arguments);
    },


    /**
     * Sending a message at level "info" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    info : function(object, message) {
      qx.log.Logger.__log("info", arguments);
    },


    /**
     * Sending a message at level "warn" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    warn : function(object, message) {
      qx.log.Logger.__log("warn", arguments);
    },


    /**
     * Sending a message at level "error" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    error : function(object, message) {
      qx.log.Logger.__log("error", arguments);
    },


    /**
     * Prints the current stack trace at level "info"
     *
     * @param object {Object?} Contextual object (either instance or static class)
     * @return {void}
     */
    trace : function(object) {
      var trace = qx.dev.StackTrace.getStackTrace();
      qx.log.Logger.__log("info",
      [(typeof object !== "undefined" ? [object].concat(trace) : trace).join("\n")]);
    },


    /**
     * Prints a method deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param fcn {Function} reference to the deprecated function. This is
     *     arguments.callee if the calling method is to be deprecated.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedMethodWarning : function(fcn, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var functionName = qx.lang.Function.getName(fcn);
        this.warn(
          "The method '"+ functionName + "' is deprecated: " +
          (msg || "Please consult the API documentation of this method for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints a class deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param clazz {Class} reference to the deprecated class.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedClassWarning : function(clazz, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var className = clazz.classname || "unknown";
        this.warn(
          "The class '"+className+"' is deprecated: " +
          (msg || "Please consult the API documentation of this class for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints an event deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param clazz {Class} reference to the deprecated class.
     * @param event {String} deprecated event name.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedEventWarning : function(clazz, event, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var className = clazz.self ? clazz.self.classname : "unknown";
        this.warn(
          "The event '"+(event || "unknown")+"' from class '"+className+"' is deprecated: " +
          (msg || "Please consult the API documentation of this class for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints a mixin deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param clazz {Class} reference to the deprecated mixin.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedMixinWarning : function(clazz, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var mixinName = clazz ? clazz.name : "unknown";
        this.warn(
          "The mixin '"+mixinName+"' is deprecated: " +
          (msg || "Please consult the API documentation of this class for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints a constant deprecation warning and a stacktrace if the setting
     * <code>qx.debug</code> is set to <code>on</code> AND the browser supports
     * __defineGetter__!
     *
     * @param clazz {Class} The class the constant is attached to.
     * @param constant {String} The name of the constant as string.
     * @param msg {String} Optional message to be printed.
     */
    deprecatedConstantWarning : function(clazz, constant, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        // check if __defineGetter__ is available
        if (clazz.__defineGetter__) {
          var self = this;
          var constantValue = clazz[constant];
          clazz.__defineGetter__(constant, function() {
            self.warn(
              "The constant '"+ constant + "' is deprecated: " +
              (msg || "Please consult the API documentation for alternatives.")
            );
            self.trace();
            return constantValue;
          });
        }
      }
    },


    /**
     * Prints a deprecation waring and a stacktrace when a subclass overrides
     * the passed method name. The deprecation is only printed if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     *
     * @param object {qx.core.Object} Instance to check for overriding.
     * @param baseclass {Class} The baseclass as starting point.
     * @param methodName {String} The method name which is deprecated for overriding.
     * @param msg {String|?} Optional message to be printed.
     */
    deprecateMethodOverriding : function(object, baseclass, methodName, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var clazz = object.constructor;

        while(clazz.classname !== baseclass.classname)
        {
          if (clazz.prototype.hasOwnProperty(methodName))
          {
            this.warn(
              "The method '" + qx.lang.Function.getName(object[methodName]) +
              "' overrides a deprecated method: " +
              (msg || "Please consult the API documentation for alternatives.")
            );
            this.trace();
            break;
          }
          clazz = clazz.superclass;
        }
      }
    },


    /**
     * Deletes the current buffer. Does not influence message handling of the
     * connected appenders.
     *
     * @return {void}
     */
    clear : function() {
      this.__buffer.clearHistory();
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL LOGGING IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /** {qx.log.appender.RingBuffer} Message buffer of previously fired messages. */
    __buffer : new qx.log.appender.RingBuffer(50),


    /** {Map} Numeric translation of log levels */
    __levels :
    {
      debug : 0,
      info : 1,
      warn : 2,
      error : 3
    },


    /**
     * Internal logging main routine.
     *
     * @param level {String} One of "debug", "info", "warn" or "error"
     * @param args {Array} List of other arguments, where the first is
     *   taken as the context object.
     * @return {void}
     */
    __log : function(level, args)
    {
      // Filter according to level
      var levels = this.__levels;
      if (levels[level] < levels[this.__level]) {
        return;
      }

      // Serialize and cache
      var object = args.length < 2 ? null : args[0];
      var start = object ? 1 : 0;
      var items = [];
      for (var i=start, l=args.length; i<l; i++) {
        items.push(this.__serialize(args[i], true));
      }

      // Build entry
      var time = new Date;
      var entry =
      {
        time : time,
        offset : time-qx.Bootstrap.LOADSTART,
        level: level,
        items: items,
        // store window to allow cross frame logging
        win: window
      };

      // Add relation fields
      if (object)
      {
        // Do not explicitly check for instanceof qx.core.Object, in order not
        // to introduce an unwanted load-time dependency
        if (object.$$hash !== undefined) {
          entry.object = object.$$hash;
        } else if (object.$$type) {
          entry.clazz = object;
        }
      }

      this.__buffer.process(entry);

      // Send to appenders
      var appender = this.__appender;
      for (var id in appender) {
        appender[id].process(entry);
      }
    },


    /**
     * Detects the type of the variable given.
     *
     * @param value {var} Incoming value
     * @return {String} Type of the incoming value. Possible values:
     *   "undefined", "null", "boolean", "number", "string",
     *   "function", "array", "error", "map",
     *   "class", "instance", "node", "stringify", "unknown"
     */
    __detect : function(value)
    {
      if (value === undefined) {
        return "undefined";
      } else if (value === null) {
        return "null";
      }

      if (value.$$type) {
        return "class";
      }

      var type = typeof value;

      if (type === "function" || type == "string" || type === "number" || type === "boolean") {
        return type;
      }

      else if (type === "object")
      {
        if (value.nodeType) {
          return "node";
        } else if (value.classname) {
          return "instance";
        } else if (value instanceof Array) {
          return "array";
        } else if (value instanceof Error) {
          return "error";
        } else if (value instanceof Date) {
          return "date";
        } else {
          return "map";
        }
      }

      if (value.toString) {
        return "stringify";
      }

      return "unknown";
    },


    /**
     * Serializes the incoming value. If it is a singular value, the result is
     * a simple string. For an array or a map the result can also be a
     * serialized string of a limited number of individual items.
     *
     * @param value {var} Incoming value
     * @param deep {Boolean?false} Whether arrays and maps should be
     *    serialized for a limited number of items
     * @return {Map} Contains the keys <code>type</code>, <code>text</code> and
     * <code>trace</code>.
     */
    __serialize : function(value, deep)
    {
      var type = this.__detect(value);
      var text = "unknown";
      var trace = [];

      switch(type)
      {
        case "null":
        case "undefined":
          text = type;
          break;

        case "string":
        case "number":
        case "boolean":
        case "date":
          text = value;
          break;

        case "node":
          if (value.nodeType === 9)
          {
            text = "document";
          }
          else if (value.nodeType === 3)
          {
            text = "text[" + value.nodeValue + "]";
          }
          else if (value.nodeType === 1)
          {
            text = value.nodeName.toLowerCase();
            if (value.id) {
              text += "#" + value.id;
            }
          }
          else
          {
            text = "node";
          }
          break;

        case "function":
          text = qx.lang.Function.getName(value) || type;
          break;

        case "instance":
          text = value.basename + "[" + value.$$hash + "]";
          break;

        case "class":
        case "stringify":
          text = value.toString();
          break;

        case "error":
          trace = qx.dev.StackTrace.getStackTraceFromError(value);
          text = value.toString();
          break;

        case "array":
          if (deep)
          {
            text = [];
            for (var i=0, l=value.length; i<l; i++)
            {
              if (text.length > 20)
              {
                text.push("...(+" + (l-i) + ")");
                break;
              }

              text.push(this.__serialize(value[i], false));
            }
          }
          else
          {
            text = "[...(" + value.length + ")]";
          }
          break;

        case "map":
          if (deep)
          {
            var temp;

            // Produce sorted key list
            var sorted = [];
            for (var key in value) {
              sorted.push(key);
            }
            sorted.sort();

            // Temporary text list
            text = [];
            for (var i=0, l=sorted.length; i<l; i++)
            {
              if (text.length > 20)
              {
                text.push("...(+" + (l-i) + ")");
                break;
              }

              // Additional storage of hash-key
              key = sorted[i];
              temp = this.__serialize(value[key], false);
              temp.key = key;
              text.push(temp);
            }
          }
          else
          {
            var number=0;
            for (var key in value) {
              number++;
            }
            text = "{...(" + number + ")}";
          }
          break;
      }

      return {
        type : type,
        text : text,
        trace : trace
      };
    }
  },


  defer : function(statics)
  {
    var logs = qx.Bootstrap.$$logs;
    for (var i=0; i<logs.length; i++) {
      statics.__log(logs[i][0], logs[i][1]);
    }

    qx.Bootstrap.debug = statics.debug;
    qx.Bootstrap.info = statics.info;
    qx.Bootstrap.warn = statics.warn;
    qx.Bootstrap.error = statics.error;
    qx.Bootstrap.trace = statics.trace;
  }
});
