qx.Class.define("qx.log.appender.Formatter", {
  extend: qx.core.Object,
  
  properties: {
    /** How to format time in an entry; offset since start (backwards compatible) or as actual date/time */
    formatTimeAs: {
      init: "offset",
      check: [ "offset", "datetime" ]
    }
  },

  members: {

    /**
     * Formats a numeric time offset to 6 characters.
     * 
     * @param offset
     *          {Integer} Current offset value
     * @param length
     *          {Integer?6} Refine the length
     * @return {String} Padded string
     */
    formatOffset: function(offset, length) {
      var str = offset.toString();
      var diff = (length || 6) - str.length;
      var pad = "";

      for (var i = 0; i < diff; i++) {
        pad += "0";
      }

      return pad + str;
    },
    
    /**
     * Formats the time part of an entry
     * 
     * @param entry {Map} the entry to output
     * @return {String} formatted time, as an offset or date time depending on `formatTimeAs` property
     */
    formatEntryTime: function(entry) {
      if (this.getFormatTimeAs() == "offset") {
        return this.formatOffset(entry.offset, 6);
      }
      if (!qx.log.appender.Formatter.__DATETIME_FORMAT) {
        qx.log.appender.Formatter.__DATETIME_FORMAT = new qx.util.format.DateFormat("YYYY-MM-dd HH:mm:ss");
      }
      return qx.log.appender.Formatter.__DATETIME_FORMAT.format(entry.time);
    },
    
    /**
     * Normalises the entry into an object with clazz, object, hash.
     * 
     * @param entry {Map} the entry to output
     * @return {Map} result, containing:
     *  clazz {Class?} the class of the object
     *  object {Object?} the object
     *  hash {String?} the hash code 
     */
    normalizeEntryClass: function(entry) {
      var result = {
          clazz: null,
          object: null,
          hash: null
      };
      
      if (entry.object) {
        result.hash = entry.object;
        if (entry.clazz) {
          result.clazz = entry.clazz;
        } else {
          var obj = entry.win.qx.core.ObjectRegistry.fromHashCode(entry.object, true);
          if (obj) {
            result.clazz = obj.constructor;
            result.object = obj;
          }
        }
      } else if (entry.clazz) {
        result.clazz = entry.clazz;
      }
      
      return result;
    },
    
    /**
     * Formats the object part of an entry
     * 
     * @param entry {Map} the entry to output
     * @return {String} formatted object, with class and hash code if possible
     */
    formatEntryObjectAndClass: function(entry) {
      var breakdown = this.normalizeEntryClass(entry);
      var result = "";
      if (breakdown.clazz) {
        result += breakdown.clazz.classname;
      }
      if (breakdown.hash) {
        result += "[" + breakdown.hash + "]";
      }
      result += ":";
      return result;
    },
    
    /**
     * Formats the items part of an entry
     * 
     * @param entry {Map} the entry to output
     * @return {String} formatted items
     */
    formatEntryItems: function(entry) {
      var output = [];
      var items = entry.items;

      for (var i = 0, il = items.length; i < il; i++) {
        var item = items[i];
        var msg = item.text;

        if (item.trace && item.trace.length > 0) {
          msg += "\n" + item.trace;
        }

        if (msg instanceof Array) {
          var list = [];
          for (var j = 0, jl = msg.length; j < jl; j++) {
            list.push(msg[j].text);
          }

          if (item.type === "map") {
            output.push("{", list.join(", "), "}");
          } else {
            output.push("[", list.join(", "), "]");
          }
        } else {
          output.push(msg);
        }
      }
      
      return output.join(" ");
    },

    /**
     * Converts a single log entry to plain text
     * 
     * @param entry {Map} The entry to process
     * @return {String} the formatted log entry
     */
    toText: function(entry) {
      var output = this.formatEntryTime(entry) + " " +
            this.formatEntryObjectAndClass(entry);
      var str = this.formatEntryItems(entry);
      if (str) {
        output += " " + str;
      }

      return output;
    },

    /**
     * Converts a single log entry to an array of plain text.  
     * 
     * This use of arrays is an outdated performance improvement, and as there is no 
     * specification of what is in each of the elements of the array, there is no value 
     * in preserving this.  This method is deprecated because it will be removed in 7.0
     * and only toText will remain.  Note that toTextArray is not used anywhere in Qooxdoo.
     * 
     * @param entry {Map} The entry to process
     * @return {Array} Argument list ready message array.
     * @deprecated {6.0} See toText instead
     */
    toTextArray: function(entry) {
      var output = [];

      output.push(this.formatEntryTime(entry));
      output.push(this.formatEntryObjectAndClass(entry));
      output.push(this.formatEntryItems(entry));

      return output;
    },
    
    /**
     * Converts a single log entry to HTML
     * 
     * @signature function(entry)
     * @param entry {Map} The entry to process
     */
    toHtml: function(entry) {
      var output = [];
      var item, msg, sub, list;

      output.push("<span class='offset'>", this.formatEntryTime(entry), "</span> ");

      var breakdown = this.normalizeEntryClass(entry);
      var result = "";
      if (breakdown.clazz) {
        result += breakdown.clazz.classname;
      }
      if (breakdown.object) {
        output.push("<span class='object' title='Object instance with hash code: " + 
            breakdown.object.toHashCode() + "'>", breakdown.classname, "[", breakdown.object, "]</span>: ");
      } else if (breakdown.hash) {
        output.push("<span class='object' title='Object instance with hash code: " + 
            breakdown.hash + "'>", breakdown.classname, "[", breakdown.hash, "]</span>: ");
      } else if (breakdown.clazz) {
        output.push("<span class='object'>" + breakdown.clazz.classname, "</span>: ");
      }

      var items = entry.items;
      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];
        msg = item.text;

        if (msg instanceof Array) {
          var list = [];

          for (var j = 0, jl = msg.length; j < jl; j++) {
            sub = msg[j];
            if (typeof sub === "string") {
              list.push("<span>" + qx.log.appender.Formatter.escapeHTML(sub) + "</span>");
            } else if (sub.key) {
              list.push("<span class='type-key'>" + sub.key + "</span>:<span class='type-" + sub.type + "'>"
                  + qx.log.appender.Formatter.escapeHTML(sub.text) + "</span>");
            } else {
              list.push("<span class='type-" + sub.type + "'>" + qx.log.appender.Formatter.escapeHTML(sub.text) + "</span>");
            }
          }

          output.push("<span class='type-" + item.type + "'>");

          if (item.type === "map") {
            output.push("{", list.join(", "), "}");
          } else {
            output.push("[", list.join(", "), "]");
          }

          output.push("</span>");
        } else {
          output.push("<span class='type-" + item.type + "'>" + qx.log.appender.Formatter.escapeHTML(msg) + "</span> ");
        }
      }

      var wrapper = document.createElement("DIV");
      wrapper.innerHTML = output.join("");
      wrapper.className = "level-" + entry.level;

      return wrapper;
    }
  },
  
  
  statics: {
    /** @type {qx.util.format.DateFormat} format for datetimes */
    __DATETIME_FORMAT: null,
    
    /** @type {qx.log.appender.Formatter} the default instance */
    __defaultFormatter: null,
    
    /**
     * Returns the default formatter
     * 
     * @return {qx.log.appender.Formatter}
     */
    getFormatter: function() {
      if (!qx.log.appender.Formatter.__defaultFormatter) {
        qx.log.appender.Formatter.__defaultFormatter = new qx.log.appender.Formatter();
      }
      return qx.log.appender.Formatter.__defaultFormatter;
    },
    
    /**
     * Sets the default formatter
     * 
     * @param instance {qx.log.appender.Formatter}
     */
    setFormatter: function(instance) {
      qx.log.appender.Formatter.__defaultFormatter = instance;
    },

    /**
     * Escapes the HTML in the given value
     * 
     * @param value
     *          {String} value to escape
     * @return {String} escaped value
     */
    escapeHTML: function(value) {
      return String(value).replace(/[<>&"']/g, qx.log.appender.Formatter.__escapeHTMLReplace);
    },

    /**
     * Internal replacement helper for HTML escape.
     * 
     * @param ch
     *          {String} Single item to replace.
     * @return {String} Replaced item
     */
    __escapeHTMLReplace: function(ch) {
      var map = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&#39;",
        '"': "&quot;"
      };

      return map[ch] || "?";
    }
  }
});