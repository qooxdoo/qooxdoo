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

************************************************************************ */

/**
 * Methods to place popup like widgets to other widgets, points,
 * mouse event coordinates, etc.
 */
qx.Mixin.define("qx.ui.core.MPlacement",
{
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Position of the aligned object in relation to the opener.
     *
     * Please note than changes to this property are only applied
     * when re-aligning the widget.
     *
     * The first part of the value is the edge to attach to. The second
     * part the the alignment of the orthogonal edge after the widget
     * has been attached.
     *
     * The default value "bottom-left" for example means that the
     * widget should be shown directly under the given target and
     * then should be aligned to be left edge:
     *
     * <pre>
     * |--------|
     * | target |
     * |--------|
     * |-------------|
     * |   widget    |
     * |-------------|
     * </pre>
     */
    position :
    {
      check :
      [
        "top-left", "top-right",
        "bottom-left", "bottom-right",
        "left-top", "left-bottom",
        "right-top", "right-bottom"
      ],
      init : "bottom-left",
      themeable : true
    },

    /** Whether the widget should moved using DOM methods. */
    domMove :
    {
      check : "Boolean",
      init : false
    },

    /**
     * Whether the widget should be positioned in the most
     * optimal way e.g. try to keep it visible.
     */
    smart :
    {
      check : "Boolean",
      init : true,
      themeable : true
    },

    /** Left offset of the mouse pointer (in pixel) */
    offsetLeft :
    {
      check : "Integer",
      init : 0,
      themeable : true
    },

    /** Top offset of the mouse pointer (in pixel) */
    offsetTop :
    {
      check : "Integer",
      init : 0,
      themeable : true
    },

    /** Right offset of the mouse pointer (in pixel) */
    offsetRight :
    {
      check : "Integer",
      init : 0,
      themeable : true
    },

    /** Bottom offset of the mouse pointer (in pixel) */
    offsetBottom :
    {
      check : "Integer",
      init : 0,
      themeable : true
    },

    /** Offsets in one group */
    offset :
    {
      group : [ "offsetTop", "offsetRight", "offsetBottom", "offsetLeft" ],
      mode  : "shorthand",
      themeable : true
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

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
     *   of the widget relative coords the document.
     */
    getLayoutLocation : function(widget)
    {
      // Use post-layout dimensions
      // which do not rely on the final rendered DOM element
      var insets, bounds, left, top;

      // Add bounds of the widget itself
      bounds = widget.getBounds();
      left = bounds.left;
      top = bounds.top;

      // Keep size to protect it for loop
      var size = bounds;

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
        right : left + size.width,
        bottom : top + size.height
      };
    },


    /**
     * Set the position. Used low-level high-performance DOM
     * methods when the property {@link #domMove} is enabled.
     *
     * @param left {Integer} The left position
     * @param top {Integer} The top position
     */
    moveTo : function(left, top)
    {
      if (this.getDomMove()) {
        this.setDomPosition(left, top);
      } else {
        this.setLayoutProperties({ left: left, top: top });
      }
    },


    /**
     * Places the widget to another (at least layouted) widget. The DOM
     * element is not needed, but the bounds are needed to compute the
     * location of the widget to align to.
     *
     * @param target {qx.ui.core.Widget} Target coords align coords
     */
    placeToWidget : function(target)
    {
      var coords = target.getContainerLocation() || this.getLayoutLocation(target);
      this.__place(coords);
    },


    /**
     * Places the widget to the mouse cursor position.
     *
     * @param event {qx.event.type.Mouse} Mouse event to align to
     */
    placeToMouse : function(event)
    {
      var left=event.getDocumentLeft();
      var top=event.getDocumentTop();

      var coords =
      {
        left: left,
        top: top,
        right: left,
        bottom: top
      };

      this.__place(coords);
    },


    /**
     * Places the widget to any (rendered) DOM element.
     *
     * @param elem {Element} DOM element to align to
     */
    placeToElement : function(elem)
    {
      var location = qx.bom.element.Location.get(elem);
      var coords =
      {
        left: location.left,
        top: location.top,
        right: location.left + elem.offsetWidth,
        bottom: location.top + elem.offsetHeight
      };

      this.__place(coords);
    },


    /**
     * Places the widget in relation to the given point
     *
     * @param point {Map} Coordinate of any point with the keys <code>left</code>
     *   and <code>top</code>.
     */
    placeToPoint : function(point)
    {
      var coords =
      {
        left: point.left,
        top: point.top,
        right: point.left,
        bottom: point.top
      };

      this.__place(coords);
    },


    /**
     * Internal method to read specific this properties and
     * apply the results to the this afterwards.
     *
     * @param coords {Map} Location of the object to align the this to. This map
     *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
     *   and <code>bottom</code>.
     */
    __place : function(coords)
    {
      var size = this.getSizeHint();
      var area = this.getLayoutParent().getBounds();
      var position = this.getPosition();
      var smart = this.getSmart();
      var offsets =
      {
        left : this.getOffsetLeft(),
        top : this.getOffsetTop(),
        right : this.getOffsetRight(),
        bottom : this.getOffsetBottom()
      }

      var result = qx.util.PlaceUtil.compute(size, area, coords, position, smart, offsets);
      this.moveTo(result.left, result.top);
    }
  }
});
