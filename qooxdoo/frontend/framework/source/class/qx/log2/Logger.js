/*
# Temporary dependency extension
#use(qx.log2.Console)
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
    
    
    
    
    register : function(appender)
    {
      if (appender.$$id) {
        return;  
      }
      
      this.debug("Registering appender: ", appender);
      
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

      this.debug("Unregistering appender: ", appender);
      delete this.__appender[id];
      delete appender.$$id;
    },
    
    
    
    
    __categories : {},
    
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
      var item, type, msg, time;
      for (var i=0, l=data.length; i<l; i++) 
      {
        item = data[i];
        type = this.__detect(item);
        msg = this.__serialize(item, type)
        time = new Date;

        msgs.push({
          time : time,
          offset : time-this.__start,
          type : type,
          msg : msg
        });
      }
      
      // Build entry
      var entry = {level:level, msgs:msgs};
      
      // Update buffer
      var buffer = this.__buffer;
      buffer.push(entry);
      buffer.splice(this.treshold);
      
      // Send to appenders
      var appender = this.__appender;
      for (var id in appender) {
        appender[id].process(entry);
      }
      
      // Firebug support
      if (window.console && console.firebug && console[entry.level]) {
        window.console[entry.level].apply(window.console, this.__toArguments(entry.msgs));
      }
    },  
    
    
    __toArguments : function(msgs)
    {
      var output = [];
      
      for (var i=0, l=msgs.length; i<l; i++) {
        output.push(msgs[i].msg);
      }
      
      return output; 
    },


    __escapeHtml : function(html) {
      return html ? html.replace(/&/g, "&#38;").replace(/</g, "&#60;").replace(/>/g, "&#62;") : "";
    },


    __detect : function(item)
    {
      if (item === undefined) {
        return "undefined";
      } else if (item === null) {
        return "null";
      }
      
      var type = typeof item;

      if (type == "string" || type === "number" || type === "boolean") {
        return type;
      } 

      if (item.$$type) {
        return "class";
      }
      
      if (type === "function") {
        return "function";
      }

      if (type === "object") 
      {
        if (item.classname) {
          return "instance";
        } else if (item instanceof Array) {
          return "array";
        } else {
          return "map";
        }
      }

      if (item.toString) {
        return "stringify";
      }
      
      return "unknown";      
    },
    
    
    __serialize : function(item, type)
    {
      switch(type)
      {
        case "null":
        case "undefined":
        case "function":
          return type;
          
        case "string":
          return this.__escapeHtml(item);
        
        case "number":
        case "boolean":
          return item;
        
        case "class":
        case "stringify":
        case "instance":
          return item.toString();
          
        case "array":
          var ret = "";
          for (var i=0, l=item.length; i<l; i++) 
          {
            if (i !== 0) {
              ret += ", ";
            }
            
            ret += this.__escapeHtml(item[i]);
            
            if (ret.length > 25) {
              return "[" + ret.substring(0, 25) + "...]";
            }
          }
          return "[" + ret + "]";
        
        case "map":
          var ret = [];
          for (var key in item) 
          {
            ret.push(key);
            if (ret.length == 3) 
            {
              ret.push("...");
              break;
            }
          }
          
          return "{" + ret.join(", ") + "}";
      }
      
      return "unknown";
    }
  }  
});
