/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var qx = require("qooxdoo");

require("./Logger");

var LEVELS = ["trace", "debug", "info", "warn", "error", "fatal" ];

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
var PADDING = "";
function padding(minLen) {
  while (PADDING.length < minLen)
    PADDING += "     ";
  return PADDING;
}
function rpad(str, len) {
  str = "" + str;
  if (str.length < len)
    str = (str + padding(len)).substring(0, len);
  return str;
}

qx.Class.define("qxcompiler.utils.LogManager", {
  extend: qx.core.Object,

  construct: function() {
    this.base(arguments);
    var t = this;
    this._loggers = {};
    this._levels = {};
    this._sinks = [];
    this._config = {};
    this._defaultSink = qxcompiler.utils.LogManager.consoleSink;
    this.addSink(this._defaultSink);
    LEVELS.forEach(function(levelId, index) {
      t._levels[levelId] = index;
    });
    this._defaultLevel = this._levels.info;
  },

  statics: {
    __instance: null,

    /**
     * Returns the global instance
     * @returns {null}
     */
    getInstance: function() {
      if (!this.__instance)
        this.__instance = new qxcompiler.utils.LogManager();
      return this.__instance;
    },

    nullSink: function(logger, level, msg) {
      // Nothing
    },

    consoleSink: function(logger, level, msg) {
      var dt = new Date();
      var str = dt.getFullYear() + "-" + zeropad2(dt.getMonth() + 1) + "-" + zeropad2(dt.getDate()) + " " +
          zeropad2(dt.getHours()) + ":" + zeropad2(dt.getMinutes()) + ":" + zeropad2(dt.getSeconds()) + "." + zeropad3(dt.getMilliseconds());
      console.log(str + " [" + rpad(level, 5) + "] " + rpad(logger.getId(), 15, true) + " " + msg);
    }
  },

  members: {
    loadConfig: function(config) {
      if (typeof config == "string")
        config = JSON.parse(fs.readFileSync(config));

      var t = this;
      this._config = config;
      this._defaultLevel = this.getLoggerLevel("__default__", "info");
      for (var id in this._loggers) {
        var logger = this._loggers[id];
        logger.setMinLevel(t.getLoggerLevel(logger.getId()));
      }
    },

    getLogger: function(id) {
      var logger = this._loggers[id];
      if (!logger) {
        logger = this._loggers[id] = new qxcompiler.utils.Logger(id, this.getLoggerLevel(id));
      }
      return logger;
    },

    getLoggerLevel: function(id, defaultLevel) {
      var cat = this._config && this._config.categories && this._config.categories[id];
      var level = cat && cat.level;
      if (level)
        level = this._levels[level];
      if (typeof level == "number")
        return level;
      if (defaultLevel)
        return this._levels[defaultLevel];
      return this._defaultLevel;
    },

    addSink: function(sink) {
      this._sinks.push(sink);
    },

    removeSink: function(sink) {
      var index = this._sinks.indexOf(sink);
      if (index > -1)
        this._sinks.splice(index, 1);
    },

    output: function(logger, level, msg) {
      if (typeof level != "string")
        level = LEVELS[level];
      this._sinks.forEach(function(sink) {
        sink.call(this, logger, level, msg);
      });
    },

    setDefaultSink: function(sink) {
      var oldSink = this._defaultSink;
      if (this._defaultSink)
        this.removeSink(this._defaultSink);
      this._defaultSink = sink;
      if (sink)
        this.addSink(sink);
      return oldSink;
    }
  }
});


module.exports = qxcompiler.utils.LogManager;



