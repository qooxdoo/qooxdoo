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
 * Event class for mouse events dispatched on a widget.
 */
qx.Class.define("qx.ui.event.type.Mouse",
{
  extend : qx.event.type.Mouse,

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
    },


    /**
     * Get a secondary event target related to an UI event. This attribute is
     * used with the mouseover event to indicate the event target which the
     * pointing device exited and with the mouseout event to indicate the
     * event target which the pointing device entered.
     *
     * @return {qx.ui.core.Wodget} The secondary event target.
     */
    getRelatedTarget : function() {
      return qx.ui.core.Widget.getWidgetByElement(this.getDomRelatedTarget());
    },

    /**
     * Get a secondary event target related to an UI event. This attribute is
     * used with the mouseover event to indicate the event target which the
     * pointing device exited and with the mouseout event to indicate the
     * event target which the pointing device entered.
     *
     * @return {Element} The secondary event target.
     */
    getDomRelatedTarget : function() {
      return qx.event.type.Mouse.prototype.getRelatedTarget.call(this);
    }
  }
});