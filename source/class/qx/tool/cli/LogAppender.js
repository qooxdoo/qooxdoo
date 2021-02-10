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


qx.Class.define("qx.tool.cli.LogAppender", {
  statics: {
    __minLevel: "warn",
    __LEVELS: ["error", "warn", "info", "debug", "trace"],

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
      if (numLevel > this.__minLevel) {
        return;
      }
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

      var items = entry.items;
      var item;
      var msg;
      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];
        msg = item.text;

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
