/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)
     * Thomas Herchenroeder (thron7)
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * Log appender for qooxdoo applications running in Node.js. Writes log
 * messages to STDOUT/STDERR.
 *
 * @ignore(process.*)
 */
qx.Class.define("qx.log.appender.NodeConsole", {
  statics: {
    /**
     * process.stdout
     */
    __OUT: null,
    /**
     * process.stderr
     */
    __ERR: null,

    /**
     * Whether to use color codes
     */
    __useColors: false,

    /**
     * Which ANSI color codes to use for which log level
     */
    __colorCodes: {
      debug: "\u001b[38;5;3m", // yellow
      info: "\u001b[38;5;12m", // light blue
      warn: "\u001b[38;5;9m", // light right
      error: "\u001b[38;5;1m", // red
      reset: "\u001b[0m"
    },

    /**
     * Turn the use of colors on or off
     * @param {Boolean} value
     */
    setUseColors(value) {
      qx.core.Assert.assertBoolean(value);
      this.__useColors = value;
    },

    /**
     * Writes a message to the shell. Errors will be sent to STDERR, everything
     * else goes to STDOUT
     *
     * @param logMessage {String} Message to be logged
     * @param level {String} Log level. One of "debug", "info", "warn", "error"
     */
    log(logMessage, level) {
      if (this.__useColors && this.__colorCodes[level]) {
        logMessage =
          this.__colorCodes[level] + logMessage + this.__colorCodes.reset;
      }
      if (level === "error") {
        this.__ERR.write(logMessage + "\n");
      } else {
        this.__OUT.write(logMessage + "\n");
      }
    },

    /**
     * Logs a debug message
     *
     * @param logMessage {String} Message to be logged
     */
    debug(logMessage) {
      this.log(logMessage, "debug");
    },

    /**
     * Logs an info message
     *
     * @param logMessage {String} Message to be logged
     */
    info(logMessage) {
      this.log(logMessage, "info");
    },

    /**
     * Logs a warning message
     *
     * @param logMessage {String} Message to be logged
     */
    warn(logMessage) {
      this.log(logMessage, "warn");
    },

    /**
     * Logs an error message
     *
     * @param logMessage {String} Message to be logged
     */
    error(logMessage) {
      this.log(logMessage, "error");
    },

    /**
     * Process a log entry object from qooxdoo's logging system.
     *
     * @param entry {Map} Log entry object
     */
    process(entry) {
      let level = entry.level || "info";
      for (let prop of Object.keys(entry)) {
        if (prop === "items") {
          let items = entry[prop];
          for (var p = 0; p < items.length; p++) {
            let item = items[p];
            this[level](item.text);
          }
        }
      }
    }
  },

  /**
   * @ignore(process.*)
   */
  defer(statics) {
    if (typeof process !== "undefined") {
      statics.__OUT = process.stdout;
      statics.__ERR = process.stderr;
      qx.log.Logger.register(statics);
    }
  }
});
