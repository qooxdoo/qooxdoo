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

************************************************************************ */

/**
 * Processes the incoming log entry and displays it by means of the native
 * logging capabilities of the client.
 *
 * Supported browsers:
 * * Firefox using an installed FireBug.
 * * Safari using newer features of Web Inspector.
 * * Internet Explorer 8.
 *
 * Currently unsupported browsers:
 * * Opera using the <code>postError</code> (disabled due to missing
 *     functionality in opera as of version 9.6).
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
     * Processes a single log entry
     *
     * @signature function(entry)
     * @param entry {Map} The entry to process
     * @return {void}
     */
    process : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(entry)
      {
        if (window.console && console.firebug) {
          console[entry.level].call(console, qx.log.appender.Util.toText(entry));
        }
      },

      "mshtml" : function(entry)
      {
        if (window.console)
        {
          var level = entry.level;
          if (level == "debug") {
            level = "log";
          }

          // IE8 as of RC1 does not support "apply" on the console object methods
          var args = qx.log.appender.Util.toText(entry);
          console[level](args);
        }
      },

      "webkit" : function(entry)
      {
        if (window.console)
        {
          var level = entry.level;
          if (level == "debug") {
            level = "log";
          }

          // Webkit does not support "apply" on the console object methods
          var args = qx.log.appender.Util.toText(entry);
          console[level](args);
        }
      },

      "opera" : function(entry)
      {
        // Opera's debugging as of 9.6 is not really useful, so currently
        // qooxdoo's own console makes more sense

        /*
        if (window.opera && opera.postError) {
          opera.postError.apply(opera, qx.log.appender.Util.toTextArray(entry));
        }
        */
      }
    })
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
