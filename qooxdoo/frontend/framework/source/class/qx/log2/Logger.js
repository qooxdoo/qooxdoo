/*
# Temporary dependency extension
#use(qx.log2.Console)
#use(qx.log2.Native)
*/


qx.Bootstrap.define("qx.log2.Logger",
{
  statics :
  {
    // PUBLIC SETTINGS
    treshold : 100,
    level : "debug",

    // INTERNAL DATA
    __buffer : [],
    __appender : {},
    __id : 0,

    __start : new Date,

    __levels :
    {
      debug : 0,
      info : 1,
      warn : 2,
      error : 3
    },

    __categories : {},




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

    unregister : function(appender)
    {
      var id = appender.$$id;
      if (id == null) {
        return;
      }

      delete this.__appender[id];
      delete appender.$$id;
    },





    enable : function(category) {
      this.__categories[category] = true;
    },

    disable : function(category) {
      delete this.__categories[category];
    },




    debug : function() {
      this.__log("debug", arguments)
    },

    info : function() {
      this.__log("info", arguments)
    },

    warn : function() {
      this.__log("warn", arguments)
    },

    error : function() {
      this.__log("error", arguments)
    },

    clear : function() {
      this.buffer.length = 0;
    },




    __log : function(level, data)
    {
      // Filter according to level
      var levels = this.__levels;
      if (levels[level] < levels[this.level]) {
        return;
      }

      // Serialize and cache
      var items = [];
      for (var i=0, l=data.length; i<l; i++) {
        items.push(this.__serialize(data[i], true));
      }

      // Build entry
      var time = new Date;
      var entry =
      {
        time : time,
        offset : time-this.__start,
        level: level,
        items: items
      };

      // Update buffer
      var buffer = this.__buffer;
      buffer.push(entry);
      buffer.splice(this.treshold);

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
     * @param item {var} Incoming value
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
        if (value.classname) {
          return "instance";
        } else if (value instanceof Array) {
          return "array";
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

        case "function":
          text = qx.dev.StackTrace.getFunctionName(value) || type;
          break;

        case "instance":
          text = value.classname + "[" + value.$$hash + "]";
          break;

        case "class":
        case "stringify":
          text = value.toString();
          break;

        case "array":
          if (deep)
          {
            text = [];
            for (var i=0, l=value.length; i<l; i++) {
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
            for (var key in value) {
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
