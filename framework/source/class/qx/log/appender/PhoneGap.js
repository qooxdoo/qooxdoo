/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   ======================================================================

   This class contains code based on the following work:

   * Unify Project

     Homepage:
       http://unify-project.org

     Copyright:
       2009-2010 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Processes the incoming log entry and displays it using the PhoneGap
 * logging capabilities.
 *
 * @require(qx.log.appender.Util)
 * @ignore(debug.*)
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

    if (qx.core.Environment.get("phonegap")) {
      register();
    }
  }
});
