/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009-2010 Deutsche Telekom AG, Germany, http://www.dtag.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#require(qx.log.appender.Util)
#ignore(debug)

************************************************************************ */

/**
 * Processes the incoming log entry and displays it using the PhoneGap
 * logging capabilities.
 */
qx.Class.define("qx.log.appender.PhoneGap",
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
     * @param entry {Map} The entry to process
     *
     * @lint ignoreUndefined(debug)
     */
    process : function(entry)
    {
      var args = qx.log.appender.Util.toText(entry);
      var level = entry.level;
      if (level == "warn") {
        debug.warn(args);
      } else if (level == "error") {
        debug.error(args);
      } else {
        debug.log(args);
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    function register()
    {
      if (window.debug) {
        qx.log.Logger.register(statics);
      } else {
        window.setTimeout(register, 200);
      }
    }

    register();
  }
});
