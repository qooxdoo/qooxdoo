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
 * Collection of common widget event methods.
 */
qx.Mixin.define("qx.ui.event.type.MWidgetEvent",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns whether the DOM node of the event target is inside of the given
     * widget.
     *
     * @param widget {qx.ui.core.Widget} container widget to check for.
     * @return {Boolean} Whether the DOM node of the event target is inside of
     *     the given widget.
     */
    isTargetInsideWidget : function(widget)
    {
      return qx.dom.Hierarchy.contains(
        widget._containerElement.getDomElement(),
        this._target
      );
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
    }
  }
});