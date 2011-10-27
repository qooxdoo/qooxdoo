/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Log appender for qooxdoo applications running in Mozilla Rhino. Writes log
 * messages to a text file.
 */

qx.Class.define("qx.log.appender.RhinoFile", {

  statics:
  {
    /**
     * Path/name of the log file to use, relative to the directory Rhino was
     * called from.
     */
    FILENAME : null,

    __FILEHANDLE : null,

    /**
     * Writes a message to the file.
     *
     * @param logMessage {String} Message to be logged
     * @param level {String} Log level. One of "debug", "info", "warn", "error"
     */
    log : function(logMessage, level)
    {
      if (!qx.log.appender.RhinoFile.__FILEHANDLE) {
        qx.log.appender.RhinoFile.create();
      }

      var logFile = qx.log.appender.RhinoFile.__FILEHANDLE;
      logFile.write(logMessage);
      logFile.newLine();
      logFile.flush();
    },


    /**
     * Logs a debug message
     *
     * @param logMessage {String} Message to be logged
     */
    debug : function(logMessage)
    {
      this.log(logMessage, "debug");
    },

    /**
     * Logs an info message
     *
     * @param logMessage {String} Message to be logged
     */
    info : function(logMessage)
    {
      this.log(logMessage, "info");
    },

    /**
     * Logs a warning message
     *
     * @param logMessage {String} Message to be logged
     */
    warn : function(logMessage)
    {
      this.log(logMessage, "warn");
    },

    /**
     * Logs an error message
     *
     * @param logMessage {String} Message to be logged
     */
    error : function(logMessage)
    {
      this.log(logMessage, "error");
    },

    /**
     * Process a log entry object from qooxdoo's logging system.
     *
     * @param entry {Map} Log entry object
     */
    process : function(entry)
    {
      var level = entry.level || "info";
      for (var prop in entry) {
        if (prop == "items") {
          var items = entry[prop];
          for (var p=0, l=items.length; p<l; p++) {
            var item = items[p];
            this[level](item.text);
          }
        }
      }
    },


    /**
     * Creates a new log file using the value of {@link #FILENAME} as the
     * file path/name.
     */
    create : function()
    {
      if (qx.log.appender.RhinoFile.__FILEHANDLE) {
        qx.log.appender.RhinoFile.__FILEHANDLE.close();
      }

      if (!qx.log.appender.RhinoFile.FILENAME) {
        qx.log.appender.RhinoFile.FILENAME = "qooxdoo.log";
      }

      var fstream = new java.io.FileWriter(qx.log.appender.RhinoFile.FILENAME, true);
      qx.log.appender.RhinoFile.__FILEHANDLE = new java.io.BufferedWriter(fstream);
    }

  }
});

