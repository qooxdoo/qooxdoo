/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Sends test report data to a server using HTTP.
 */
qx.Class.define("simulator.reporter.Reporter", {

  statics:
  {
    SERVER_URL : null,
    DATABASE_ID : null,
    DATE_FORMAT : null,

    /**
     * Writes a message to the file.
     *
     * @param logMessage {String} Message to be logged
     * @param level {String} Log level. One of "debug", "info", "warn", "error"
     *
     * The 'A' is needed because without it Textile will interpret the following
     * line as an acronym definition:
     * @lint ignoreUndefined(readUrl, A)
     */
    log : function(logMessage, level)
    {
      if (!this.DATE_FORMAT) {
        this.DATE_FORMAT = new qx.util.format.DateFormat("YYYY-MM-dd_HH-mm-ss");
      }

      if (!this.DATABASE_ID) {
        this.__createReport();
      }

      var entry = {
        test_id : this.DATABASE_ID,
        date : this.DATE_FORMAT.format(new Date()),
        log_level : level,
        message : logMessage
      };

      var stringData = qx.lang.Json.stringify(entry);
      var encodedData = encodeURIComponent(stringData);
      var url = this.SERVER_URL + "?entry=" + encodedData;
      readUrl(url);
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
          for (var p in items) {
            var item = items[p];
            this[level](item.text);
          }
        }
      }
    },

    /**
     * Collects environment information and sends initial test data to the
     * server.
     *
     * @lint ignoreUndefined(readUrl, A)
     */
    __createReport : function()
    {
      var startDate = this.DATE_FORMAT.format(new Date());
      var autWin = simulator.Simulation.AUTWINDOW + ".";
      var autName = String(simulator.QxSelenium.getInstance().getEval(autWin + 'qx.core.Environment.get("qx.application")'));
      autName = /(.*?)\./.exec(autName)[1];
      autName = autName.replace(/^./, autName[0].toUpperCase());
      var testOs = String(simulator.QxSelenium.getInstance().getEval(autWin + "qx.core.Environment.get('os.name')"));
      var qxRevision = String(simulator.QxSelenium.getInstance().getEval(autWin + 'qx.core.Environment.get("qx.revision")'));
      var userAgent = String(simulator.QxSelenium.getInstance().getEval(autWin + "navigator.userAgent"));
      var browserTitle = String(simulator.QxSelenium.getInstance().getEval(autWin + 'qx.core.Environment.get("browser.name")'));

      var testData = {
        aut_name : autName,
        aut_host : qx.core.Environment.get("simulator.autHost"),
        aut_path : qx.core.Environment.get("simulator.autPath"),
        test_os : testOs,
        test_useragent : userAgent,
        test_browsertitle : browserTitle,
        svn_revision : qxRevision,
        start_date : startDate
      };

      var stringData = qx.lang.Json.stringify(testData);
      var encodedData = encodeURIComponent(stringData);
      var url = this.SERVER_URL + "?test=" + encodedData;

      var response = readUrl(url);
      if (response.indexOf("saved") > 0) {
        this.DATABASE_ID = /ID\:\ (.*)/.exec(response)[1];
      }
    }
  }
});