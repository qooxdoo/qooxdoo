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

/* ************************************************************************

#use(qx.log.appender.Console)
#use(qx.log.appender.Native)

************************************************************************ */

/**
 * Main qooxdoo logging class.
 *
 * Used as central logging feature by qx.core.Object.
 *
 * Extremely modular and lightweight to support logging at bootstrap and
 * at shutdown as well.
 *
 * * Supports dynamic appenders to push the output to the user.
 * * Supports buffering of the last 50 messages (configurable)
 * * Support different debug level (debug, info, error and warn)
 * * Simple data serialization for incoming messages
 */
qx.Bootstrap.define("qx.log.Logger",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CONFIGURATION
    ---------------------------------------------------------------------------
    */    
    
    treshold : 50,
    level : "debug",




    /*
    ---------------------------------------------------------------------------
      APPENDER MANAGMENT
    ---------------------------------------------------------------------------
    */

    /** {Map} Map of all known appenders by their ID */
    __appender : {},    
    
    
    /** {Integer} Last free appender ID */
    __id : 0,
    
    
    /**
     * Registers the given appender and inserts the last
     * cached messages.
     *
     * @type static
     * @param appender {Class} A static appender class supporting at 
     *   least <code>process</code> to handle incoming messages.
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

      // Insert previous messages
      var buffer = this.__buffer;
      for (var i=0, l=buffer.length; i<l; i++) {
        appender.process(buffer[i]);
      }
    },
    

    /**
     * Unregisters the given appender
     *
     * @type static
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
     * Sending a message at debug level to the logger.
     *
     * @type static
     * @param object {Object} Contextual object (could be an instance or a static class)
     * @param message {var} Multiple arguments are supported. Each could be any
     *   JavaScript variable type. All data gets serialized directly and does not store
     *   any references to objects anymore.
     * @return {void}
     */
    debug : function(object, message) {
      this.__log("debug", arguments);
    },


    /**
     * Sending a message at info level to the logger.
     *
     * @type static
     * @param object {Object} Contextual object (could be an instance or a static class)
     * @param message {var} Multiple arguments are supported. Each could be any
     *   JavaScript variable type. All data gets serialized directly and does not store
     *   any references to objects anymore.
     * @return {void}
     */
    info : function(object, message) {
      this.__log("info", arguments);
    },


    /**
     * Sending a message at warning level to the logger.
     *
     * @type static
     * @param object {Object} Contextual object (could be an instance or a static class)
     * @param message {var} Multiple arguments are supported. Each could be any
     *   JavaScript variable type. All data gets serialized directly and does not store
     *   any references to objects anymore.
     * @return {void}
     */
    warn : function(object, message) {
      this.__log("warn", arguments);
    },


    /**
     * Sending a message at error level to the logger.
     *
     * @type static
     * @param object {Object} Contextual object (could be an instance or a static class)
     * @param message {var} Multiple arguments are supported. Each could be any
     *   JavaScript variable type. All data gets serialized directly and does not store
     *   any references to objects anymore.
     * @return {void}
     */
    error : function(object, message) {
      this.__log("error", arguments);
    },


    /**
     * Deletes the current buffer. Has no influence on the message handling of the
     * connected appenders.
     *
     * @type static
     * @return {void}
     */
    clear : function() {
      this.buffer.length = 0;
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL LOGGING IMPLEMENTATION
    ---------------------------------------------------------------------------
    */
    
    /** {Array} Message buffer of previously fired messages. */
    __buffer : [],
    
    
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
     * @type static
     * @param level {String} One of debug, info, warn or error
     * @param args {Array} List of other arguments where the first is 
     *   interpretected as a context object.
     * @return {void}
     */
    __log : function(level, args)
    {
      // Filter according to level
      var levels = this.__levels;
      if (levels[level] < levels[this.level]) {
        return;
      }

      // Serialize and cache
      var object = args[0];
      var items = [];
      for (var i=1, l=args.length; i<l; i++) {
        items.push(this.__serialize(args[i], true));
      }

      // Build entry
      var time = new Date;
      var entry =
      {
        time : time,
        offset : time-qx.Bootstrap.LOADSTART,
        level: level,
        items: items
      };

      // Add relation fields
      if (object) 
      {
        if (object instanceof qx.core.Object) {
          entry.object = object.$$hash;
        } else if (object.$$type) {
          entry.clazz = object;
        }      
      } 

      // Update buffer
      var buffer = this.__buffer;
      buffer.push(entry);
      if (buffer.length>(this.treshold+10)) {
        buffer.splice(this.treshold);
      }

      // Send to appenders
      var appender = this.__appender;
      for (var id in appender) {
        appender[id].process(entry);
      }
    },


    /**
     * Detects the type of the given variable.
     *
     * @type static
     * @param value {var} Incoming value
     * @return {String} Type of the incoming value
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
     * Serializes incoming item to a string or a list of serialized values
     * for arrays and maps.
     *
     * @type static
     * @param value {var} Incoming value
     * @param deep {Boolean?false} Whether arrays and maps should be
     *    inspected for their content.
     * @return {Map} Contains the keys <code>type</code> and <code>text</code>.
     */
    __serialize : function(value, deep)
    {
      var type = this.__detect(value);
      var text = "unknown";

      switch(type)
      {
        case "null":
        case "undefined":
          text = type;
          break;

        case "string":
        case "number":
        case "boolean":
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
          text = qx.dev.StackTrace.getFunctionName(value) || type;
          break;

        case "instance":
          text = value.basename + "[" + value.$$hash + "]";
          break;

        case "class":
        case "stringify":
        case "error":
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
                text.push(this.__serialize("...", false));
                break;
              }

              text.push(this.__serialize(value[i], false));
            }
          }
          else
          {
            text = "[...]";
          }
          break;

        case "map":
          if (deep)
          {
            text = [];
            for (var key in value)
            {
              if (text.length > 20)
              {
                text.push(this.__serialize("...", false));
                break;
              }

              text.push(this.__serialize(key, false));
            }
          }
          else
          {
            text = "{...}";
          }
          break;
      }

      return {
        type : type,
        text : text
      };
    }
  }
});
