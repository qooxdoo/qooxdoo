/*
# Temporary dependency extension
#use(qx.log2.Console)
#use(qx.log2.Firebug)
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
      var msgs = [];
      var item, time, detect;
      for (var i=0, l=data.length; i<l; i++)
      {
        item = data[i];
        detect = this.__serialize(item, true)
        time = new Date;

        msgs.push({
          time : time,
          offset : time-this.__start,
          type : detect.type,
          msg : detect.value
        });
      }

      // Build entry
      var entry = {
        level: level,
        msgs: msgs
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


    __detect : function(item)
    {
      if (item === undefined) {
        return "undefined";
      } else if (item === null) {
        return "null";
      }

      var type = typeof item;

      if (item.$$type) {
        return "class";
      }

      else if (type === "function" || type == "string" || type === "number" || type === "boolean") {
        return type;
      }

      else if (type === "object")
      {
        if (item.classname) {
          return "instance";
        } else if (item instanceof Array) {
          return "array";
        } else {
          return "map";
        }
      }

      else if (item.toString) {
        return "stringify";
      }

      return "unknown";
    },


    /**
     * Serializes incoming item to a string or a list of serialized values
     * for arrays and maps.
     *
     * @type static
     * @param item {var} Incoming item
     * @param
     */
    __serialize : function(item, deep)
    {
      var type = this.__detect(item);
      var value = "unknown";

      switch(type)
      {
        case "null":
        case "undefined":
          value = type;
          break;

        case "string":
        case "number":
        case "boolean":
          value = item;
          break;

        case "function":
          value = qx.dev.StackTrace.getFunctionName(item) || type;
          break;

        case "class":
        case "stringify":
        case "instance":
          value = item.toString();
          break;

        case "array":
          if (deep)
          {
            value = [];
            for (var i=0, l=item.length; i<l; i++) {
              value.push(this.__serialize(item[i], false));
            }
          }
          else
          {
            value = "[...]";
          }
          break;

        case "map":
          if (deep)
          {
            value = [];
            for (var key in item) {
              value.push(key);
            }
          }
          else
          {
            value = "{...}";
          }
          break;
      }

      return {
        type : type,
        value : value
      };
    }
  }
});
