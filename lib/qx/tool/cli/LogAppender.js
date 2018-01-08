/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Sebastian Werner (wpbasti)

 ************************************************************************ */
const qx = require("qooxdoo"); 

qx.Class.define("qxcli.LogAppender", {
  statics: {
    __minLevel: "warn",
    __LEVELS: [ "error", "warn", "info", "debug", "trace"],
    
    setMinLevel: function(minLevel) {
      this.__minLevel = minLevel;
    },
    
    /**
     * Processes a single log entry
     * 
     * @param entry
     *          {Map} The entry to process
     */
    process: function(entry) {
      var numLevel = this.__LEVELS[entry.level]||0;
      if (numLevel > this.__minLevel)
        return;
      var level = entry.level !== "debug" && console[entry.level] ? entry.level : "log";
      if (console[level]) {
        var args = this.toText(entry);
        console[level](args);
      }
    },

    /**
     * Converts a single log entry to plain text
     * 
     * @param entry
     *          {Map} The entry to process
     * @return {String} the formatted log entry
     */
    toText: function(entry) {
      return this.toTextArray(entry).join(" ");
    },

    /**
     * Converts a single log entry to an array of plain text
     * 
     * @param entry
     *          {Map} The entry to process
     * @return {Array} Argument list ready message array.
     */
    toTextArray: function(entry) {
      var output = [];

      function zeropad2(val) {
        if (val < 10)
          return "0" + val;
        return "" + val;
      }
      function zeropad3(val) {
        if (val < 10)
          return "00" + val;
        if (val < 100)
          return "0" + val;
        return "" + val;
      }
      var dt = entry.time;
      var str = dt.getFullYear() + "-" + zeropad2(dt.getMonth() + 1) + "-" + zeropad2(dt.getDate()) + " " +
        zeropad2(dt.getHours()) + ":" + zeropad2(dt.getMinutes()) + ":" + zeropad2(dt.getSeconds()) + "." + zeropad3(dt.getMilliseconds());

      output.push(str);

      var items = entry.items;
      var item, msg;
      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];
        msg = item.text;

        if (item.trace && item.trace.length > 0) {
          if (typeof (this.FORMAT_STACK) == "function") {
            qx.log.Logger.deprecatedConstantWarning(qx.log.appender.Util, "FORMAT_STACK",
                "Use qx.dev.StackTrace.FORMAT_STACKTRACE instead");
            msg += "\n" + this.FORMAT_STACK(item.trace);
          } else {
            msg += "\n" + item.trace;
          }
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

      return output;
    },

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
    }
  },

  defer: function(statics) {
    qx.log.Logger.register(statics);
  }
});
