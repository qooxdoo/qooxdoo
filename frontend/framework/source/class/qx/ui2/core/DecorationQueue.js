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
 * This class maintains a list of all widgets, which need an update of their
 * decoration. All decoration changes can then be done at once.
 */
qx.Class.define("qx.ui2.core.DecorationQueue",
{
  statics :
  {
    _decorationQueue : {},

    /**
     * Mark a widget's decoration as invalid and add it to the queue.
     *
     * @type static
     * @param widget {qx.ui2.core.Widget} Widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      this._decorationQueue[widget.toHashCode()] = widget;
      qx.ui2.core.QueueManager.scheduleFlush();
    },


    /**
     * Mark a widget's decoration as valid and remove it from the queue.
     *
     * @type static
     * @param widget {qx.ui2.core.Widget} Widget to add.
     * @return {void}
     */
    remove : function(widget) {
      this._decorationQueue[widget.toHashCode()] = null;
    },


    /**
     * Update the decoration of all widgets from the decoration queue.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      for (var widgetHash in this._decorationQueue)
      {
        var widget = this._decorationQueue[widgetHash];
        if (widget) {
          widget.updateDecoration(widget.getComputedWidth(), widget.getComputedHeight());
        }
      }

      this._decorationQueue = {};
    }
  }
});
