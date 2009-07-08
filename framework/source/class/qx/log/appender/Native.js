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

/**
 * Processes the incoming log entry and displays it to the native
 * logging capabilities of this client.
 *
 * * Firefox using an installed FireBug.
 * * Safari using new features of Web Inspector.
 * * Opera using the <code>postError</code> (currently disabled through missing funcionality).
 * * Internet Explorer 8.
 */
qx.Bootstrap.define("qx.log.appender.Native",
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
    process : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(entry)
      {
        if (window.console && console.firebug) {
          console[entry.level].apply(console, qx.log.appender.Util.toTextArray(entry));
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

          // IE8 as of RC1 do not support "apply" on the console object methods
          var args = qx.log.appender.Util.toText(entry).join(" ");
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

          // Webkit do not support "apply" on the console object methods
          var args = qx.log.appender.Util.toText(entry);
          console[level](args);
        }
      },

      "opera" : function(entry)
      {
        // Opera's debugging as of 9.6 is not really useful
        // Our own console makes a lot more sense

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

  defer : function(statics) 
  {
    if (window.console && window.console.clear) {
      console.clear();
    }
    
    qx.log.Logger.register(statics);
  }
});
