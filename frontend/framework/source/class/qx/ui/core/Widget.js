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

/*
#require(qx.ui.event.WidgetEventHandler)
*/

/**
 * This is the base class for all widgets.
 *
 * A widget consists of at least three DOM elements. The container element,
 * which is
 * added to the parent widget has two child Element: The "decoration" and the
 * "content" element. The decoration element has a lower z-Index and contains
 * markup to render the widget's backround and border using an implementation
 * of {@link qx.ui.decoration.IDecorator}.The cntent element is positioned
 * inside the "container" element to respect paddings and contains the "real"
 * widget element.
 *
 *  <pre>
 * -container------------
 * |                    |
 * |  -decoration----   |
 * |  | -content----|-  |
 * |  | |           ||  |
 * |  --|------------|  |
 * |    --------------  |
 * |                    |
 * ----------------------
 *  </pre>
 */
qx.Class.define("qx.ui.core.Widget",
{
  extend : qx.ui.core.LayoutItem,
  include : qx.util.manager.MConnectedObject,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._containerElement = this._createContainerElement();
    this._contentElement = this._createContentElement();
    this._containerElement.add(this._contentElement);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    show : "qx.event.type.Event",
    hide : "qx.event.type.Event",

    /** Fired after a visibility/parent change when the widget finally appears on the screen. */
    appear : "qx.event.type.Event",

    /** Fired after a visibility/parent change when the widget finally disappears on the screen. */
    disappear : "qx.event.type.Event",

    /** Fired on resize (after layouting) of the widget. */
    resize : "qx.event.type.Data",

    /** Fired on move (after layouting) of the widget. */
    move : "qx.event.type.Data",

    /** Fired if the mouse curser moves over the widget. */
    mousemove : "qx.ui.event.type.Mouse",

    /** Fired if the mouse curser enters the widget. */
    mouseover : "qx.ui.event.type.Mouse",

    /** Fired if the mouse curser leaves widget. */
    mouseout : "qx.ui.event.type.Mouse",

    /** Fired if a mouse button is pressed on the widget. */
    mousedown : "qx.ui.event.type.Mouse",

    /** Fired if a mouse button is released on the widget. */
    mouseup : "qx.ui.event.type.Mouse",

    /** Fired if the widget is clicked using the left mouse button. */
    click : "qx.ui.event.type.Mouse",

    /** Fired if the widget is double clicked using the left mouse button. */
    dblclick : "qx.ui.event.type.Mouse",

    /** Fired if the widget is clicked using the right mouse button. */
    contextmenu : "qx.ui.event.type.Mouse",

    /** Fired if the mouse wheel is used over the widget. */
    mousewheel : "qx.ui.event.type.Mouse",

    // key events
    keyup : "qx.ui.event.type.KeySequence",
    keydown : "qx.ui.event.type.KeySequence",
    keypress : "qx.ui.event.type.KeySequence",
    keyinput : "qx.ui.event.type.KeyInput",

    // focus events
    focus : "qx.ui.event.type.Event",
    blur : "qx.ui.event.type.Event",
    focusin : "qx.ui.event.type.Event",
    focusout : "qx.ui.event.type.Event",
    beforedeactivate : "qx.ui.event.type.Event",
    beforeactivate : "qx.ui.event.type.Event",
    activate : "qx.ui.event.type.Event",
    deactivate : "qx.ui.event.type.Event",

    // capture event

    /**
     * Fired is the widget becomes the capturing widget by a call to {@link #capture}.
     */
    capture : "qx.ui.event.type.Event",

    /**
     * Fired is the widget looses the capturing mode by a call to
     * {@link #releaseCapture} or a mouse click.
     */
    losecapture : "qx.ui.event.type.Event"

  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    /** Selected layout of instance {@link qx.ui.layout.Abstract} */
    layout :
    {
      check : "qx.ui.layout.Abstract",
      nullable : true,
      init : null,
      apply : "_applyLayout"
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the user provided minimal width of the widget. If the value is set
     * to <code>null</code> the preferred minimum width of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
     */
    minWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the preferred width of the widget. If the value is set
     * to <code>null</code> the preferred width of the widget's content
     * is used.
     *
     * The widget's computed width may differ from the given width due to
     * widget stretching. Also take a look at the related properties
     * {@link #minWidth} and {@link #maxWidth}.
     */
    width :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided maximal width of the widget. If the value is set
     * to <code>null</code> the preferred maximal width of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #width} and {@link #minWidth}.
     */
    maxWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true

    },


    /**
     * Sets the user provided minimal height of the widget. If the value is set
     * to <code>null</code> the preferred minimal height of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
     */
    minHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the preferred height of the widget. If the value is set
     * to <code>null</code> the preferred height of the widget's content
     * is used.
     *
     * The widget's computed height may differ from the given height due to
     * widget stretching. Also take a look at the related properties
     * {@link #minHeight} and {@link #maxHeight}.
     */
    height :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided maximal height of the widget. If the value is set
     * to <code>null</code> the preferred maximal height of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #height} and {@link #minHeight}.
     */
    maxHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },



    /*
    ---------------------------------------------------------------------------
      STRETCHING
    ---------------------------------------------------------------------------
    */

    /** Whether the widget can grow horitontally. */
    allowGrowX :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the widget can shrink horitontally. */
    allowShrinkX :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the widget can grow vertically. */
    allowGrowY :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the widget can shrink vertically. */
    allowShrinkY :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },



    /*
    ---------------------------------------------------------------------------
      PADDING
    ---------------------------------------------------------------------------
    */

    /** Padding of the widget (top) */
    paddingTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /** Padding of the widget (right) */
    paddingRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * The 'padding' property is a shorthand property for setting 'paddingTop',
     * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
     *
     * If four values are specified they apply to top, right, bottom and left respectively.
     * If there is only one value, it applies to all sides, if there are two or three,
     * the missing values are taken from the opposite side.
     */
    padding :
    {
      group : [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ],
      mode  : "shorthand",
      themeable : true
    },






    /*
    ---------------------------------------------------------------------------
      THEMEABLE
    ---------------------------------------------------------------------------
    */

    /**
     * The decorator property points to an object, which is responsible
     * for drawing the widget's decoration, e.g. border, background or shadow
     */
    decorator :
    {
      nullable : true,
      init : null,
      apply : "_applyDecorator",
      event : "changeDecorator",
      check : "qx.ui.decoration.IDecorator",
      themeable : true
    },


    /**
     * The text color the rendered widget.
     */
    textColor :
    {
      nullable : true,
      init : "inherit",
      check : "Color",
      apply : "_applyTextColor",
      event : "changeTextColor",
      themeable : true,
      inheritable : true
    },


    /**
     * The background color the rendered widget.
     */
    backgroundColor :
    {
      nullable : true,
      init : "inherit",
      check : "Color",
      apply : "_applyBackgroundColor",
      event : "changeBackgroundColor",
      themeable : true,
      inheritable : true
    },


    /** The font property describes how to paint the font on the widget. */
    font :
    {
      nullable : true,
      init : "inherit",
      apply : "_applyFont",
      check : "Font",
      event : "changeFont",
      themeable : true,
      inheritable : true
    },


    /**
     * Whether the widget is enabled. Disabled widgets are usually grayed out
     * and don't receive user input events.
     */
    enabled :
    {
      init : "inherit",
      check : "Boolean",
      inheritable : true,
      apply : "_applyEnabled",
      event : "changeEnabled"
    },


    /**
     * If you switch this to true, the widget doesn't receive any user input
     * events like key, mouse or focus events.
     */
    anonymous :
    {
      check : "Boolean",
      init: false,
      inheritable : true,
      event : "changeAnonymous"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the widget, which contains the given DOM element.
     *
     * @param {Element} The DOM element to search the widget for.
     * @return {qx.ui.core.Widget} The widget containing the element.
     */
    getWidgetByElement : function(element)
    {
      while(element)
      {
        var widgetKey = qx.bom.element.Attribute.get(element, "QxWidget");
        if (widgetKey)
        {
          // dereference "weak" reference to the widget.
          return qx.core.Object.getObjectByHashCode(widgetKey);
        }

        element = element.parentNode;
      }
      return null;
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    setParent : function(parent)
    {
      this._parent = parent;
      this.__toggleDisplay();
    },


    // overridden
    updateLayout : function()
    {
      var computed = this.__computedLayout;
      this.renderLayout(computed.left, computed.top, computed.width, computed.height);
    },


    // overridden
    renderLayout : function(left, top, width, height)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (left == null || top == null || width == null || height == null)
        {
          this.trace();
          this.debug("left: " + left + ", top: " + top + ", width: " + width + ", height: " + height);
          throw new Error("Something went wrong with the layout of " + this.toString() + "!");
        }
      }

      // Cache some often used stuff in local variables
      var computed = this.__computedLayout;
      var container = this._containerElement;
      var content = this._contentElement;
      var pixel = "px";

      // Create data structure for computed layout
      if (!computed) {
        computed = this.__computedLayout = {};
      }

      // Detect location changes
      var locationChange = (left !== computed.left || top !== computed.top);
      if (locationChange)
      {
        computed.left = left;
        computed.top = top;

        container.setStyle("left", left + pixel);
        container.setStyle("top", top + pixel);
      }

      if (this.hasHeightForWidth())
      {
        // Note: What when other stuff reproduces a reflow here.
        // Is this really correct to just check for null here?
        // Wouldn't it be more stable to re-calculate the
        // heightForWidth and compare it e.g. ignore it when
        // it has the same value than before?

        // Only try once for each layout iteration
        if (this.__heightForWidth != null)
        {
          delete this.__heightForWidth;
        }
        else
        {
          var flowHeight = this.getHeightForWidth(width);
          // this.debug("Height for width " + width + "px: " + height + "px => " + flowHeight + "px");

          if (height !== flowHeight)
          {
            this.__heightForWidth = flowHeight;
            this.scheduleLayoutUpdate();

            // Fabian thinks this works flawlessly
            return;
          }
        }
      }

      var sizeChange = (width !== computed.width || height !== computed.height);

      if (sizeChange || !this._hasValidLayout)
      {
        // Compute inner width
        var insets = this.getInsets();

        var innerWidth = width - insets.left - insets.right;
        var innerHeight = height - insets.top - insets.bottom;

        // React on size change
        if (sizeChange)
        {
          computed.width = width;
          computed.height = height;

          container.setStyle("width", width + pixel);
          container.setStyle("height", height + pixel);

          content.setStyle("left", insets.left + pixel);
          content.setStyle("top", insets.top + pixel);
          content.setStyle("width", innerWidth + pixel);
          content.setStyle("height", innerHeight + pixel);

          this.updateDecoration(width, height);
        }

        // If the current layout is invalid force a relayout even if
        // the size has not changed
        if (sizeChange || !this._hasValidLayout)
        {
          var layout = this.getLayout();
          if (layout && layout.hasChildren()) {
            layout.renderLayout(innerWidth, innerHeight);
          }

          this._hasValidLayout = true;
        }
      }

      // After doing the layout fire change events
      if (sizeChange && this.hasListeners("resize")) {
        this.fireDataEvent("resize", computed);
      }

      if (locationChange && this.hasListeners("move")) {
        this.fireDataEvent("move", computed);
      }
    },


    // overridden
    hasValidLayout : function() {
      return !!this._hasValidLayout;
    },


    // overridden
    invalidateLayoutCache : function()
    {
      // this.debug("Mark widget layout invalid: " + this);
      this._hasValidLayout = false;

      // invalidateLayoutCache cached size hint
      this._sizeHint = null;

      // invalidateLayoutCache layout manager
      var layout = this.getLayout();
      if (layout) {
        layout.invalidateLayoutCache();
      }
    },






    /*
    ---------------------------------------------------------------------------
      SIZE HINTS
    ---------------------------------------------------------------------------
    */

    /**
     * A size hint computes the dimensions of a widget. It returns
     * the the recommended dimensions as well as the min and max dimensions.
     * Existing technical limits are also respected. The min and max values
     * already respect the stretching properties.
     *
     * <h3>Wording</h3>
     * <ul>
     * <li>User value: Value defined by the widget user, using the size properties</li>
     *
     * <li>Technical value: Technical minimum value defined by the widget author
     *     {@link #_getTechnicalLimits}.</li>
     *
     * <li>Layout value: The value computed by {@link #_getContentHint}</li>
     * </ul>
     *
     * <h3>Algorithm</h3>
     * <ul>
     * <li>minSize: If the user min size or the technical min size is not null, the
     *     maximum of both is taken. Otherwise the layout value is used.</li>
     *
     * <li>(preferred) size: If the user value is not null the user value is used,
     *     otherwise the layout value is used.</li>
     *
     * <li>max size: Same as the preferred size.</li>
     * </ul>
     *
     *
     * @type member
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }


      // the widget size
      // start with the user defined values
      var sizeHint =
      {
        width : this.getWidth(),
        minWidth : this.getMinWidth(),
        maxWidth : this.getMaxWidth(),
        height : this.getHeight(),
        minHeight : this.getMinHeight(),
        maxHeight : this.getMaxHeight()
      }


      // apply technical min size
      var technicalLimits = this._getTechnicalLimits();

      if (technicalLimits.minWidth != null)
      {
        if (sizeHint.minWidth != null) {
          sizeHint.minWidth = Math.max(sizeHint.minWidth, technicalLimits.minWidth);
        } else {
          userSite.minWidth = technicalLimits.minWidth;
        }
      }

      if (technicalLimits.minHeight != null)
      {
        if (sizeHint.minHeight != null) {
          sizeHint.minHeight = Math.max(sizeHint.minHeight, technicalLimits.minHeight);
        } else {
          userSite.minHeight = technicalLimits.minHeight;
        }
      }


      // compute content hint
      var contentHint = this._getContentHint();

      var insets = this.getInsets();
      var insetX = insets.left + insets.right;
      var insetY = insets.top + insets.bottom;


      // merge size with content size hint
      sizeHint.width = sizeHint.width != null ? sizeHint.width : contentHint.width + insetX;
      sizeHint.minWidth = sizeHint.minWidth != null ? sizeHint.minWidth : contentHint.minWidth + insetX;
      sizeHint.maxWidth = sizeHint.maxWidth != null ? sizeHint.maxWidth : contentHint.maxWidth + insetX;
      sizeHint.height = sizeHint.height != null ? sizeHint.height : contentHint.height + insetY;
      sizeHint.minHeight = sizeHint.minHeight != null ? sizeHint.minHeight : contentHint.minHeight + insetY;
      sizeHint.maxHeight = sizeHint.maxHeight != null ? sizeHint.maxHeight : contentHint.maxHeight + insetY;


      // height for width
      if (this.__heightForWidth)
      {
        // this.debug("Use HeightForWidth: " + this.__heightForWidth);
        sizeHint.height = this.__heightForWidth;
      }


      // limit to allowed range
      sizeHint.width = Math.max(sizeHint.minWidth, Math.min(sizeHint.width, sizeHint.maxWidth));
      sizeHint.height = Math.max(sizeHint.minHeight, Math.min(sizeHint.height, sizeHint.maxHeight));


      // apply stretching
      var growX = this.getAllowGrowX();
      var shrinkX = this.getAllowShrinkX();
      var growY = this.getAllowGrowY();
      var shrinkY = this.getAllowShrinkY();

      if (!growX) {
        sizeHint.maxWidth = sizeHint.width;
      }
      if (!shrinkX) {
        sizeHint.minWidth = sizeHint.width;
      }
      if (!growY) {
        sizeHint.maxHeight = sizeHint.height;
      }
      if (!shrinkY) {
        sizeHint.minHeight = sizeHint.height;
      }

      this._sizeHint = sizeHint;
      return sizeHint;
    },


    // overridden
    getCachedSizeHint : function() {
      return this._sizeHint || null;
    },


    /**
     * Returns the recommended/natural dimensions of the widget's content.
     *
     * For labels and images this may be their natural size when defined without
     * any dimensions. For containers this may be the recommended size of the
     * underlaying layout manager.
     *
     * Developer note: This can be overwritten by the derived classes to allow
     * a custom handling here.
     *
     * @type member
     * @return {Map}
     */
    _getContentHint : function()
    {
      var layout = this.getLayout();
      if (layout)
      {
        if (layout.hasChildren())
        {
          return layout.getSizeHint();
        }
        else
        {
          return {
            width : 0,
            minWidth : 0,
            maxWidth : Infinity,
            height : 0,
            minHeight : 0,
            maxHeight : Infinity
          };
        }
      }

      return {
        width : 100,
        minWidth : 0,
        maxWidth : Infinity,
        height : 50,
        minHeight : 0,
        maxHeight : Infinity
      };
    },



    // overridden
    getHeightForWidth : function(width)
    {
      // Prepare insets
      var insets = this.getInsets();

      var insetX = insets.left + insets.right;
      var insetY = insets.top + insets.bottom;

      // Compute content width
      var contentWidth = width - insetX;

      // Compute height
      var contentHeight = this._getContentHeightForWidth(contentWidth);

      // Computed box height
      var height = contentHeight + insetY;

      return height;
    },


    /**
     * Returns the technical size limits of this widget.
     *
     * Developer note: This method should be overwritten by derived classes
     * to define the minimum width which keeps the widget usable.
     * This may be for example, that at least the icon and 2 characters of a
     * tab view button are viewable etc. The dimension given here is not
     * refinable by the widget users and give the widget author a good
     * way to integrate a hard-coded technical minimum width.
     *
     * @internal
     * @type member
     * @return {Map} Map with <code>minWidth</code> and <code>minHeight</code>.
     *     A value of <code>null</code> means that the widget does not have a
     *     technical min size.
     */
    _getTechnicalLimits : function()
    {
      return {
        minWidth : null,
        minHeight : null
      };
    },





    /*
    ---------------------------------------------------------------------------
      INSET CALCULATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Return the insets of the widget's inner element relative to its
     * container element. The inset is the sum of the padding and border width.
     *
     * @return {Map} Contains the keys <code>top</code>, <code>right</code>,
     *   <code>bottom</code> and <code>left</code>. All values are integers.
     */
    getInsets : function()
    {
      var top = this.getPaddingTop();
      var right = this.getPaddingRight();
      var bottom = this.getPaddingBottom();
      var left = this.getPaddingLeft();

      var decorator = this.getDecorator();
      if (decorator)
      {
        var inset = decorator.getInsets();

        top += inset.top;
        right += inset.right;
        bottom += inset.bottom;
        left += inset.left;
      }

      return {
        "top" : top,
        "right" : right,
        "bottom" : bottom,
        "left" : left
      };
    },





    /*
    ---------------------------------------------------------------------------
      COMPUTED LAYOUT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget's computed location and dimension as computed by
     * the layout manager.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map} The widget location and dimensions in pixel
     *    (if the layout is valid). Contains the keys
     *    <code>width</code>, <code>height</code>, <code>left</code> and
     *    <code>top</code>.
     */
    getComputedLayout : function() {
      return this.__computedLayout || null;
    },


    /**
     * Returns the widget's computed inner dimension as available
     * through the layout process.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map} The widget inner dimension in pixel (if the layout is
     *    valid). Contains the keys <code>width</code> and <code>height</code>.
     */
    getComputedInnerSize : function()
    {
      var computed = this.__computedLayout;
      if (!computed) {
        return null;
      }

      var insets = this.getInsets();

      // Return map data
      return {
        width : computed.width - insets.left - insets.right,
        height : computed.height - insets.top - insets.bottom
      };
    },





    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT: IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // {Boolean} Whether the layout defined that the widget is visible or not.
    __layoutVisible : true,


    // property apply
    _applyVisibility : function(value, old)
    {
      this.__toggleDisplay();

      // only force a layout update if visibility change from/to "exclude"
      var parent = this._parent;
      if (parent && (old === "excluded" || value === "excluded"))
      {
        var parentLayout = parent.getLayout();
        if (parentLayout) {
          parentLayout.childExcludeModified(this);
        }

        parent.scheduleLayoutUpdate();
      }
    },


    layoutVisibilityModified : function(value)
    {
      if (value !== this.__layoutVisible)
      {
        if (value) {
          delete this.__layoutVisible;
        } else {
          this.__layoutVisible = false;
        }

        this.__toggleDisplay();
      }
    },


    /**
     * Helper method to handle visibility changes.
     *
     * @type member
     * @return {void}
     */
    __toggleDisplay : function()
    {
      if (this.getParent() && this.__layoutVisible && this.getVisibility() === "visible")
      {
        this.$$visible = true;

        // Make the element visible (again)
        this._containerElement.show();

        // Prepare for "appear" event
        qx.ui.core.DisplayQueue.add(this);

        // Fire "show" event
        if (this.hasListeners("show")) {
          this.fireEvent("show");
        }
      }
      else if (this.$$visible)
      {
        delete this.$$visible;

        // On parent removal it gets completely removed from DOM
        // which means we do not need to apply any display styles
        // on it.
        if (this.getParent()) {
          this._containerElement.hide();
        }

        // Prepare for "disappear" event
        qx.ui.core.DisplayQueue.add(this);

        // Fire "hide" event
        if (this.hasListeners("hide")) {
          this.fireEvent("hide");
        }
      }
    },






    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT: USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Make this widget visible.
     *
     * @type member
     * @return {void}
     */
    show : function() {
      this.setVisibility("visible");
    },


    /**
     * Hide this widget.
     *
     * @type member
     * @return {void}
     */
    hide : function() {
      this.setVisibility("hidden");
    },


    /**
     * Hide this widget and exclude it from the underlying layout.
     *
     * @type member
     * @return {void}
     */
    exclude : function() {
      this.setVisibility("excluded");
    },


    /**
     * Whether the widget is locally visible.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is visible
     */
    isVisible : function() {
      return !!this.$$visible;
    },


    /**
     * Whether the widget is locally hidden.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is hidden
     */
    isHidden : function() {
      return !this.$$visible;
    },


    /**
     * Whether the widget is locally excluded.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is excluded
     */
    isExcluded : function() {
      return this.getVisibility() === "excluded";
    },






    /*
    ---------------------------------------------------------------------------
      CREATION OF HTML ELEMENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Create the widget's container HTML element.
     *
     * @return {qx.html.Element} The container HTML element
     */
    _createContainerElement : function()
    {
      var el = new qx.html.Element("div");
      el.setStyle("position", "absolute");

      // store "weak" reference to the widget in the DOM element.
      el.setAttribute("QxWidget", this.toHashCode());
      el.setStyle("zIndex", 0);

      return el;
    },


    /**
     * Create the widget's content HTML element.
     *
     * @return {qx.html.Element} The content HTML element
     */
    _createContentElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyle("position", "absolute");
      el.setStyle("zIndex", 10);
      el.setStyle("overflow", "hidden");

      return el;
    },


    /**
     * Create the widget's decoration HTML element.
     *
     * @return {qx.html.Element} The decoration HTML element
     */
    _createDecorationElement : function()
    {
      var el = new qx.html.Element("div");
      el.setStyle("zIndex", 5);
      el.setStyle("position", "absolute");
      el.setStyle("left", 0);
      el.setStyle("top", 0);
      return el;
    },



    /*
    ---------------------------------------------------------------------------
      NATIVE CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    // overridden
    nativeAddToParent : function(parent)
    {
      if (parent instanceof qx.ui.core.Widget) {
        parent._contentElement.add(this._containerElement);
      }
    },


    // overridden
    nativeRemoveFromParent : function(parent)
    {
      if (parent instanceof qx.ui.core.Widget) {
        parent._contentElement.remove(this._containerElement);
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */


    /**
     * Enables mouse event capturing. All mouse events will dispatched on this
     * widget until capturing is disabled using {@link #releaseCapture} or a
     * mouse button is clicked. If the widgets becomes the capturing widget the
     * {@link #capture} event is fired. Once it looses capture mode the
     * {@link #losecapture} event is fired.
     */
    capture : function() {
      this._containerElement.capture();
    },


    /**
     * Disables mouse capture mode enabled by {@link #capture}.
     */
    releaseCapture : function() {
      this._containerElement.releaseCapture();
    },



    /*
    ---------------------------------------------------------------------------
      DECORATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Update the decoration (background, border, ...)
     *
     * @internal Mainly for decoration queue
     * @param width {Integer} The widget's current width
     * @param height {Integer} The widget's current height
     */
    updateDecoration : function(width, height)
    {
      var decorator = this.getDecorator();
      if (decorator)
      {
        if (!this._decorationElement)
        {
          this._decorationElement = this._createDecorationElement();
          this._containerElement.add(this._decorationElement);
        }
        decorator.update(this._decorationElement, width, height);
      }

      qx.ui.core.DecorationQueue.remove(this);
    },


    // property apply
    _applyDecorator : function(value, old) {
      qx.ui.decoration.DecorationManager.getInstance().connect(this._styleDecorator, this, value);
    },


    /**
     * {Map} Default zero values for all insets
     */
    _defaultDecorationInsets : {
      top : 0, right : 0, bottom : 0, left : 0
    },


    /**
     * Callback for decoration manager connection
     *
     * @type member
     * @param decorator {qx.ui.decoration.IDecorator} the decorator object
     * @return {void}
     */
    _styleDecorator : function(decorator)
    {
      var old = this._lastDecorationInsets || this._defaultDecorationInsets;
      var current = decorator ? decorator.getInsets() : this._defaultDecorationInsets;

      // Detect inset changes
      if (old.top != current.top || old.right != current.right || old.bottom != current.bottom || old.left != current.left)
      {
        // Create copy and store for next modification.
        this._lastDecorationInsets = qx.lang.Object.copy(current);

        // Inset changes requires a layout update
        qx.ui.core.LayoutQueue.add(this);
      }
      else
      {
        // Style changes are happy with a simple decoration update
        qx.ui.core.DecorationQueue.add(this);
      }
    },




    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },


    /**
     * Callback for color manager connection
     *
     * @type member
     * @param color {Color} any CSS acceptable color value
     * @return {void}
     */
    _styleTextColor : function(color)
    {
      if (color) {
        this._containerElement.setStyle("color", color);
      } else {
        this._containerElement.resetStyle("color");
      }
    },






    /*
    ---------------------------------------------------------------------------
      OTHER PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * generic property apply method for layout relevant properties
     */
    _applyLayoutChange : function() {
      this.scheduleLayoutUpdate();
    },


    // property apply
    _applyLayout : function(value, old)
    {
      if (value) {
        value.setWidget(this);
      }
    },


    // property apply
    _applyEnabled : function(value, old) {
      // Nothing to do here, may be overridden
    },


    // property apply
    _applyBackgroundColor : function(value) {
      qx.theme.manager.Color.getInstance().connect(this._styleBackgroundColor, this, value);
    },


    /**
     * Callback for color manager connection
     *
     * @type member
     * @param color {Color} any CSS acceptable color value
     * @return {void}
     */
    _styleBackgroundColor : function(color) {
      this._containerElement.setStyle("backgroundColor", color);
    }
  },






  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // TODO

  }
});
