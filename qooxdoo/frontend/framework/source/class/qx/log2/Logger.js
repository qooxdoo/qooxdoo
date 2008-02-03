
qx.Bootstrap.define("qx.log2.Logger", 
{
  statics :
  {
    // PUBLIC SETTINGS
    treshold : 100,
    level : "debug",
    
    // INTERNAL DATA
    __buffer : [],
    __appender : [],
    __start : new Date,
    
    __levels : 
    {
      debug : 0,
      info : 1,
      warn : 2,
      error : 3
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
      var result = [];
      var item, type, msg, time;
      for (var i=0, l=data.length; i<l; i++) 
      {
        item = data[i];
        type = this.__detect(item);
        msg = this.__serialize(item, type)
        time = new Date;

        result.push({
          time : time,
          offset : time-this.__start,
          type : type,
          msg : msg
        });
      }
      
      // Update buffer
      var buffer = this.__buffer;
      buffer.push(result);
      buffer.splice(this.treshold);
      
      // Send to appenders      
      if (window.console) 
      {
        window.console[level].apply(window.console, this.__toArguments(result));
        window.console[level](this.__toString(result));
        window.console[level](this.__toHtml(result));
      }
    },  
    
    
    __toArguments : function(result)
    {
      var output = [];
      var entry;
      
      for (var i=0, l=result.length; i<l; i++) 
      {
        entry = result[i];
        output.push(entry.msg);
      }
      
      return output; 
    },


    __toString : function(result) 
    {
      var output = [];
      var entry;
      
      for (var i=0, l=result.length; i<l; i++) 
      {
        entry = result[i];
        
        if (entry.type=="qx"||entry.type=="stringify") {
          output.push(entry.msg + "(~" + entry.type + ")");
        } else {
          output.push(entry.msg);
        }
      }
      
      var offset = this.__formatOffset(entry.offset) + ": ";
      return offset + output.join(" ");      
    },
    
    
    __toHtml : function(result)
    {
      var output = [];
      var entry;
      
      for (var i=0, l=result.length; i<l; i++) 
      {
        entry = result[i];
        output.push("<span class='" + entry.type + "'>" + entry.msg + "</span>");
      }
      
      offset = "<span class='offset'>" + this.__formatOffset(entry.offset) + "</span>: ";
      
      return offset + output.join(" ");
    },
    
    
    __formatOffset : function(offset, length)
    {
      var str = offset.toString();
      var diff = (length||8) - str.length;
      var pad = "";
      
      for (var i=0; i<diff; i++) {
        pad += "0";
      }
      
      return pad+str;
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
