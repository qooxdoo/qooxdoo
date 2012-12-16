/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#require(qx.log.appender.Util)
#require(qx.bom.client.Html)  -- defer calls Logger.register which calls
                                 Native.process which needs "html.console"
                                 implementation

************************************************************************ */

/**
 * Processes the incoming log entry and displays it by means of the native
 * logging capabilities of the client.
 *
 * Supported browsers:
 * * Firefox <4 using FireBug (if available).
 * * Firefox >=4 using the Web Console.
 * * WebKit browsers using the Web Inspector/Developer Tools.
 * * Internet Explorer 8+ using the F12 Developer Tools.
 * * Opera >=10.60 using either the Error Console or Dragonfly
 *
 * Currently unsupported browsers:
 * * Opera <10.60
 */
qx.Class.define("qx.log.appender.Native",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    
    /**
     * Whether textual log output should be written into the console.
     * 
     * If <code>false</code> value are specified log items are written in the console as is (in native form).
     */
    __textOutput : true,

    /**
     * Determines whether log items should be output in textual form.
     *
     * @return {Boolean} Whether log items should be output in textual form.
     *      <ul>
     *      <li><code>true</code> - log entry will be transformed into text by <code>qx.log.appender.Util.toText</code>.
     *      <li><code>false</code> - log items (and maybe source entry) will be written in the console as is (in native form).
     *      </ul>
     */
    isTextOutput : function() {
      return this.__textOutput;
    },

    /**
     * Configures the format of log output.
     *
     * @param value {Boolean} Whether log items should be output in textual form (see {@link #isTextOutput} for details).
     */
    setTextOutput : function(value) {
      this.__textOutput = value;
    },
    
    
    /**
     * Whether textual log output should be written into the console.
     * 
     * If <code>false</code> value are specified log items are written in the console as is.
     */
    __addEntry : false,

    /**
     * Determines whether source entry should be added to log items when log output is in native (non-textual) form.
     *
     * @return {Boolean} Whether source entry should be added to log items.
     */
    isAddEntry : function() {
      return this.__addEntry;
    },

    /**
     * Configures the necessity to add source entry into log output in native (non-textual) form.
     *
     * @param value {Boolean} Whether source entry should be added to log items.
     */
    setAddEntry : function(value) {
      this.__addEntry = value;
    },
    
    
    /**
     * Processes a single log entry
     *
     * @param entry {Map} The entry to process
     */
    process : function(entry)
    {
      if (qx.core.Environment.get("html.console")) {
        // Firefox 4's Web Console doesn't support "debug"
        var level = console[entry.level] ? entry.level : "log",
            logger = console[level];
        if (logger) {
          if (this.isTextOutput()) {
            logger( qx.log.appender.Util.toText(entry) );
          }
          else {
            var args = [],
                items = entry.items;
            for (i = 0, n = items.length; i < n; i++) {
                args.push(items[i].value);
            }
            if (this.isAddEntry()) {
                args.push(" --- from entry: ", entry);
            }
            logger.apply(console, args);
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.log.Logger.register(statics);
  }
});
