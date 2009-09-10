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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An appender that writes all messages to the JsUnit console, a unit testing framework
 * for JavaScript (http://www.jsunit.net).
 * <p>
 * This class does not depend on qooxdoo widgets, so it also works when there
 * are problems with widgets or when the widgets are not yet initialized.
 * </p>
 */
qx.Class.define("qx.legacy.log.appender.JsUnit",
{
  extend : qx.legacy.log.appender.Abstract,




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
      if (window.warn && window.inform && window.debug)
      {
        var log = qx.legacy.log.Logger;
        var msg = qx.bom.String.fromText(this.formatLogEvent(evt));

        switch(evt.level)
        {
          case log.LEVEL_DEBUG:
            window.debug(msg);
            break;

          case log.LEVEL_INFO:
            window.inform(msg);
            break;

          default:
            window.warn(msg);
            break;
        }

        if (evt.level > log.LEVEL_WARN) {
          window.fail(msg);
        }
      }
    }
  }
});
