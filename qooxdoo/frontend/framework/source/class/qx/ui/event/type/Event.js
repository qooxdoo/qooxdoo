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
    },


    /**
     * Returns the DOM event target to which the event was originally
     * dispatched.
     *
     * @type member
     * @return {Element} DOM element to which the event was originally
     *       dispatched.
     */
    getDomTarget : function() {
      return this._target;
    },


    /**
     * Get the event target widget whose event listeners are currently being
     * processed. This is particularly useful during event capturing and
     * bubbling.
     *
     * @type member
     * @return {qx.ui.core.Wodget} The widget the event listener is currently
     *       dispatched on.
     */
    getCurrentTarget : function() {
      return qx.ui.core.Widget.getWidgetByElement(this._currentTarget);
    },


    /**
     * Get the event target DOM node whose event listeners are currently being
     * processed. This is particularly useful during event capturing and
     * bubbling.
     *
     * @type member
     * @return {Element} The DOM element the event listener is currently
     *       dispatched on.
     */
    getDomCurrentTarget : function() {
      return this._currentTarget;
    }
  }
});