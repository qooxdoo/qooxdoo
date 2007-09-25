/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.core.LayoutQueue",
{
  statics :
  {
    _roots : {},

    /**
     * Mark a widget's layout as invalid and add its layout root to
     * the queue.
     *
     * @type static
     * @param widget {qx.ui2.core.Widget} Widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      while(widget && widget.isLayoutValid())
      {
        widget.markLayoutInvalid();

        if (widget.isLayoutRoot())
        {
          qx.core.Log.debug("Add layout root: " + widget);

          this._roots[widget.toHashCode()] = widget;
          break;
        }

        widget = widget.getParent();
      }
    },


    /**
     * Update the layout of all widgets, which layout is marked as invalid.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      var roots = this._roots;

      for (var hc in roots)
      {
        var root = roots[hc];
        var rootHint = root.getSizeHint();

        root.layout(0, 0, rootHint.width, rootHint.height);
      }

      this._roots.length = 0;
      qx.html.Element.flush();
    }
  }
});
