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

qx.Mixin.define("qx.ui.core.MAlign",
{
  members :
  {
    /**
     * Returns the location data like {qx.bom.element.Location#get} does
     * but do not rely on DOM elements coords be rendered. Instead this method
     * works with the available layout data in the moment executed. This works
     * best when called in some type of <code>resize</code> or <code>move</code>
     * event which are supported by all widgets out of the box.
     *
     * @param widget {qx.ui.core.Widget} Any widget
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative coords the document.
     */
    getLayoutLocation : function(widget)
    {
      // Use post-layout dimensions
      // which do not rely on the final rendered DOM element
      var insets, bounds, left, top;

      // Pre-cache hint before modifying the widget variable
      var hint = widget.getBounds();

      // Add bounds of the widget itself
      bounds = widget.getBounds();
      left = bounds.left;
      top = bounds.top;

      // Now loop up with parents until reaching the root
      widget = widget.getLayoutParent();
      while (widget && !widget.isRootWidget())
      {
        // Add coordinates
        bounds = widget.getBounds();
        left += bounds.left;
        top += bounds.top;

        // Add insets
        insets = widget.getInsets();
        left += insets.left;
        top += insets.top;

        // Next parent
        widget = widget.getLayoutParent();
      }

      // Add the rendered location of the root widget
      if (widget.isRootWidget())
      {
        var rootCoords = widget.getContainerLocation();
        if (rootCoords)
        {
          left += rootCoords.left;
          top += rootCoords.top;
        }
      }

      // Build location data
      return {
        left : left,
        top : top,
        right : left + hint.width,
        bottom : top + hint.height
      };
    },


    /**
     * Returns coordinates coords align a widget coords another one.
     *
     * @param widget {qx.ui.core.Widget} Widget coords align
     * @param target {qx.ui.core.Widget} Target coords align coords
     * @param align {String} Alignment coords respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    alignToWidget : function(widget, target, align, correct)
    {
      var coords = target.getContainerLocation() || this.getLayoutLocation(target);
      this.__align(widget, coords, align, correct);
    },


    /**
     * Returns coordinates coords align a widget coords another one.
     *
     * @param widget {qx.ui.core.Widget} Widget coords align
     * @param event {qx.event.type.Mouse} Mouse event to align to
     * @param align {String} Alignment coords respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    alignToMouse : function(widget, event, align, correct)
    {
      var left=event.getDocumentLeft(), top=event.getDocumentTop();
      var coords = { left: left, top: top, right: left, bottom: top };

      this.__align(widget, coords, align, correct);
    },


    /**
     * Internal method to read specific widget properties and
     * apply the results to the widget afterwards.
     *
     * @param widget {qx.ui.core.Widget} Widget coords align
     * @param coords {Map} Location of the object to align the widget to. This map
     *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
     *   and <code>bottom</code>.
     * @param align {String} Alignment coords respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    __align : function(widget, coords, align, correct)
    {
      var size = widget.getSizeHint();
      var area = widget.getLayoutParent().getBounds();

      var result = qx.util.AlignUtil.compute(size, area, coords, align, correct);
      widget.moveTo(result.left, result.top);
    }
  }
});
