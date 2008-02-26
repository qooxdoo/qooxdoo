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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event class for events dispatched on a widget.
 */
qx.Class.define("qx.ui.event.type.Event",
{
  extend : qx.event.type.Event,
  include : qx.ui.event.type.MWidgetEvent,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the widget event target to which the event was originally
     * dispatched.
     *
     * @type member
     * @return {qx.ui.core.Wodget} widget to which the event was originally
     *       dispatched.
     */
    getTarget : function() {
      return qx.ui.core.Widget.getWidgetByElement(this._target);
    }
  }
});