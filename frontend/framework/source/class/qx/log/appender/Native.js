/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 David Perez

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez (david-perez)
     * Alexander Back (aback)

************************************************************************ */

/* ************************************************************************

#require(qx.log2.Logger)

************************************************************************ */

/**
 * An appender that writes all messages to FireBug, a nice extension for debugging and developing under Firefox.
 * <p>
 * This class does not depend on qooxdoo widgets, so it also works when there
 * are problems with widgets or when the widgets are not yet initialized.
 * </p>
 */
qx.Class.define("qx.log.appender.Native",
{
  extend : qx.log.appender.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // overridden
    appendLogEvent : function(evt)
    {
      var log = qx.log.Logger;
      var msg = this.formatLogEvent(evt);

      switch(evt.level)
      {
        case log.LEVEL_DEBUG:
          if (qx.log2.Logger.debug) {
            qx.log2.Logger.debug(msg);
          }

          break;

        case log.LEVEL_INFO:
          if (qx.log2.Logger.info) {
            qx.log2.Logger.info(msg);
          }

          break;

        case log.LEVEL_WARN:
          if (qx.log2.Logger.warn) {
            qx.log2.Logger.warn(msg);
          }

          break;

        default:
          if (qx.log2.Logger.error) {
            qx.log2.Logger.error(msg);
          }

          break;
      }

      // Force a stack dump, for helping locating the error
      if (evt.level >= log.LEVEL_WARN && (!evt.throwable || !evt.throwable.stack) && qx.log2.Logger.trace) {
        qx.log2.Logger.trace();
      }
    }
  }
});
