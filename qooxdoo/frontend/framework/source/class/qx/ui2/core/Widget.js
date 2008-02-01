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
 * This is the base class for all widgets.
 *
 * A widget consists of at least three DOM elements. The container element,
 * which is
 * added to the parent widget has two child Element: The "decoration" and the
 * "content" element. The decoration element has a lower z-Index and contains
 * markup to render the widget's backround and border using an implementation
 * of {@link qx.ui2.decoration.IDecoration}.The cntent element is positioned
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
qx.Class.define("qx.ui2.core.Widget",
{
  extend : qx.ui2.core.LayoutItem,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create content element
    this._containerElement = this._createContainerElement();
    this._decorationElement = this._createDecorationElement();
    this._contentElement = this._createContentElement();

    this._containerElement.add(this._decorationElement);
    this._containerElement.add(this._contentElement);

    // Layout data
    this._computedLayout = {};
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired after a visibility/parent change when the widget finally appears on the screen. */
    appear : "qx.event.type.Event",

    /** Fired after a visibility/parent change when the widget finally disappears on the screen. */
    disappear : "qx.event.type.Event",

    /** Fired on resize (after layouting) of the widget. */
    resize : "qx.event.type.Data",

    /** Fired on move (after layouting) of the widget. */
    move : "qx.event.type.Data",

    /** Fired if the mouse curser moves over the widget. */
    mousemove : "qx.event.type.Mouse",

    /** Fired if the mouse curser enters the widget. */
    mouseover : "qx.event.type.Mouse",

    /** Fired if the mouse curser leaves widget. */
    mouseout : "qx.event.type.Mouse",

    /** Fired if a mouse button is pressed on the widget. */
    mousedown : "qx.event.type.Mouse",

    /** Fired if a mouse button is released on the widget. */
    mouseup : "qx.event.type.Mouse",

    /** Fired if the widget is clicked using the left mouse button. */
    click : "qx.event.type.Mouse",

    /** Fired if the widget is double clicked using the left mouse button. */
    dblclick : "qx.event.type.Mouse",

    /** Fired if the widget is clicked using the right mouse button. */
    contextmenu : "qx.event.type.Mouse",

    /** Fired if the mouse wheel is used over the widget. */
    mousewheel : "qx.event.type.Mouse",

    // key events
    keyup : "qx.event.type.KeySequence",
    keydown : "qx.event.type.KeySequence",
    keypress : "qx.event.type.KeySequence",
    keyinput : "qx.event.type.KeyInput",

    // focus events
    focus : "qx.event.type.Event",
    blur : "qx.event.type.Event",
    focusin : "qx.event.type.Event",
    focusout : "qx.event.type.Event",
    beforedeactivate : "qx.event.type.Event",
    beforeactivate : "qx.event.type.Event",
    activate : "qx.event.type.Event",
    deactivate : "qx.event.type.Event",

    // inline events
    change : "qx.event.type.Data",
    input : "qx.event.type.Data",
    load : "qx.event.type.Event",
    select : "qx.event.type.Event"
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

    /** Selected layout of instance {@link qx.ui2.layout.Abstract} */
    layout :
    {
      check : "qx.ui2.layout.Abstract",
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
     * Sets the user provided minimal width of the widget. The property supports
     * the following values:
     *
     *  <ul>
     *    <li>Integer pixel value</li>
     *    <li>The string value <code>auto</code>. This will derive the minimum
     *      width from the minimum width of its content
     *    </li>
     *    <li>The string value <code>pref</code>. This will set the minimum
     *      width to the preferred width and thus disables shrinking of the widget.
     *    </li>
     *  </ul>
     *
     *  Also take a look at the related properties {@link #width} and {@link #maxWidth}.
     */
    minWidth :
    {
      apply : "_applyLayoutChange",
      init : "auto",
      themeable : true
    },


    /**
     * Sets the preferred width of the widget. The property supports
     * the following values:
     *
     *  <ul>
     *    <li>Integer pixel value</li>
     *    <li>The string value <code>auto</code>. This will derive the preferred
     *      width from the preferred width of its content
     *    </li>
     *  </ul>
     *
     * The widget's computed width may differ from the given width due to
     * widget stretching. Also take a look at the related properties
     * {@link #minWidth} and {@link #maxWidth}.
     */
    width :
    {
      init : "auto",
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * Sets the user provided maximal width of the widget. The property supports
     * the following values:
     *
     *  <ul>
     *    <li>Integer pixel value</li>
     *    <li>The string value <code>auto</code>. This will derive the maximal
     *      width from the maximal width of its content
     *    </li>
     *    <li>The string value <code>pref</code>. This will set the maximal
     *      width to the preferred width and thus disables growing of the widget.
     *    </li>
     *  </ul>
     *
     *  Also take a look at the related properties {@link #width} and {@link #minWidth}.
     */
    maxWidth :
    {
      apply : "_applyLayoutChange",
      init : 32000,
      themeable : true
    },


    /**
     * Sets the user provided minimal height of the widget. The property supports
     * the following values:
     *
     *  <ul>
     *    <li>Integer pixel value</li>
     *    <li>The string value <code>auto</code>. This will derive the minimum
     *      height from the minimum height of its content
     *    </li>
     *    <li>The string value <code>pref</code>. This will set the minimum
     *      height to the preferred height and thus disables shrinking of the widget.
     *    </li>
     *  </ul>
     *
     *  Also take a look at the related properties {@link #height} and {@link #maxHeight}.
     */
    minHeight :
    {
      apply : "_applyLayoutChange",
      init : "auto",
      themeable : true
    },


    /**
     * Sets the preferred height of the widget. The property supports
     * the following values:
     *
     *  <ul>
     *    <li>Integer pixel value</li>
     *    <li>The string value <code>auto</code>. This will derive the preferred
     *      height from the preferred height of its content
     *    </li>
     *  </ul>
     *
     * The widget's computed height may differ from the given height due to
     * widget stretching. Also take a look at the related properties
     * {@link #minHeight} and {@link #maxHeight}.
     */
    height :
    {
      apply : "_applyLayoutChange",
      init : "auto",
      themeable : true
    },


    /**
     * Sets the user provided maximal height of the widget. The property supports
     * the following values:
     *
     *  <ul>
     *    <li>Integer pixel value</li>
     *    <li>The string value <code>auto</code>. This will derive the maximal
     *      height from the maximal height of its content
     *    </li>
     *    <li>The string value <code>pref</code>. This will set the maximal
     *      height to the preferred height and thus disables growing of the widget.
     *    </li>
     *  </ul>
     *
     *  Also take a look at the related properties {@link #height} and {@link #minHeight}.
     */
    maxHeight :
    {
      apply : "_applyLayoutChange",
      init : 32000,
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
     * The decoration property points to an object, which is responsible
     * for drawing the widget's decoration, e.g. border, background or shadow
     */
    decoration :
    {
      nullable : true,
      init : null,
      apply : "_applyDecoration",
      event : "changeDecoration",
      check : "qx.ui2.decoration.IDecoration",
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
    }

  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _isLocallyVisible : true,


    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

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

      var insets = this.getInsets();

      var innerWidth = width - insets.left - insets.right;
      var innerHeight = height - insets.top - insets.bottom;

      var locationChange = (left !== this._computedLayout.left || top !== this._computedLayout.top);
      if (locationChange)
      {
        this._computedLayout.left = left;
        this._computedLayout.top = top;

        this._containerElement.setStyles({
          left : left + "px",
          top : top + "px"
        });
      }

      var sizeChange = (width !== this._computedLayout.width || height !== this._computedLayout.height);
      if (sizeChange)
      {
        this._computedLayout.width = width;
        this._computedLayout.height = height;

        this._containerElement.setStyles({
          width : width + "px",
          height : height + "px"
        });

        this._contentElement.setStyles({
          left : insets.left + "px",
          top : insets.top + "px",
          width : innerWidth + "px",
          height : innerHeight + "px"
        });

        this.updateDecoration(width, height);
      }

      // if the current layout is invalid force a relayout even if
      // the size has not changed
      if (sizeChange || !this._hasValidLayout)
      {
        var mgr = this.getLayout();
        if (mgr && mgr.hasChildren()) {
          mgr.renderLayout(innerWidth, innerHeight);
        }

        this._hasValidLayout = true;
      }

      // after doing the layout fire change events
      if (sizeChange) {
        this.fireDataEvent("resize", this._computedLayout);
      }

      if (locationChange) {
        this.fireDataEvent("move", this._computedLayout);
      }
    },


    // overridden
    hasValidLayout : function() {
      return this._hasValidLayout == true;
    },


    // overridden
    invalidateLayoutCache : function()
    {
      // this.debug("Mark widget layout invalid: " + this);
      this._hasValidLayout = false;

      // invalidateLayoutCache cached size hint
      this._sizeHint = null;

      // invalidateLayoutCache layout manager
      var mgr = this.getLayout();
      if (mgr) {
        mgr.invalidateLayoutCache();
      }
    },






    /*
    ---------------------------------------------------------------------------
      SIZE HINTS
    ---------------------------------------------------------------------------
      A size hint computes the dimensions of a widget. It returns
      the the recommended dimensions as well as the min and max dimensions.
      Existing technical limits are also respected.
    ---------------------------------------------------------------------------
    */

    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      var width, minWidth, maxWidth;
      var height, minHeight, maxHeight;

      // Prepare insets
      var insets = this.getInsets();

      var insetX = insets.left + insets.right;
      var insetY = insets.top + insets.bottom;


      // Read properties
      var width = this.getWidth();
      var minWidth = this.getMinWidth();
      var maxWidth = this.getMaxWidth();
      var height = this.getHeight();
      var minHeight = this.getMinHeight();
      var maxHeight = this.getMaxHeight();


      // Cache technical limits
      var technicalLimits = this._getTechnicalLimits();

      // Cache content hint
      var contentHint = this._getContentHint();

      if (!contentHint)
      {
        // Fix invalid values (which are also the default ones in this case)
        if (width === "auto" || height === "auto")
        {
          width = 0;
          height = 0;
        }
      }




      // X-AXIS
      // ----------------------------------------

      if (width === "auto") {
        width = contentHint.width + insetX;
      }

      if (this.canStretchX())
      {
        if (contentHint)
        {
          if (minWidth === "auto") {
            minWidth = contentHint.minWidth + insetX;
          } else if (minWidth === "pref") {
            minWidth = width;
          }

          if (maxWidth === "auto") {
            maxWidth = contentHint.maxWidth + insetX;
          } else if (maxWidth === "pref") {
            maxWidth = width;
          }
        }
        else
        {
          if (minWidth === "auto" || minWidth === "pref") {
            minWidth = 0;
          }

          if (maxWidth === "auto" || maxWidth === "pref") {
            maxWidth = 32000;
          }
        }
      }
      else
      {
        minWidth = width;
        maxWidth = width;
      }

      // Always respect technical limitations
      minWidth = Math.max(insetX, minWidth, technicalLimits.minWidth);
      maxWidth = Math.min(32000, maxWidth, technicalLimits.maxWidth);




      // Y-AXIS
      // ----------------------------------------

      if (height === "auto") {
        height = contentHint.height + insetY;
      }

      if (this.canStretchY())
      {
        if (contentHint)
        {
          if (minHeight === "auto") {
            minHeight = contentHint.minHeight + insetY;
          } else if (minHeight === "pref") {
            minHeight = height;
          }

          if (maxHeight === "auto") {
            maxHeight = contentHint.maxHeight + insetY;
          } else if (maxHeight === "pref") {
            maxHeight = height;
          }
        }
        else
        {
          if (minHeight === "auto" || minHeight === "pref") {
            minHeight = 0;
          }

          if (maxHeight === "auto" || maxHeight === "pref") {
            maxHeight = 32000;
          }
        }
      }
      else
      {
        minHeight = height;
        maxHeight = height;
      }

      // Always respect technical limitations
      minHeight = Math.max(insetY, minHeight, technicalLimits.minWidth);
      maxHeight = Math.min(32000, maxHeight, technicalLimits.maxWidth);




      // LIMITING DIMENSIONS
      // ----------------------------------------

      width = Math.max(Math.min(width, maxWidth), minWidth);
      height = Math.max(Math.min(height, maxHeight), minHeight);




      // RESULT
      // ----------------------------------------

      var hint = {
        width : width,
        minWidth : minWidth,
        maxWidth : maxWidth,
        height : height,
        minHeight : minHeight,
        maxHeight : maxHeight
      };

      // this.debug("Compute size hint: ", hint);
      return this._sizeHint = hint;
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
            maxWidth : 32000,
            height : 0,
            minHeight : 0,
            maxHeight : 32000
          };
        }
      }

      return {
        width : 100,
        minWidth : 0,
        maxWidth : 32000,
        height : 50,
        minHeight : 0,
        maxHeight : 32000
      };
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
     * @return {Map} Map with <code>minWidth</code>, <code>maxWidth</code>,
     *    <code>minHeight</code> and <code>maxHeight</code>.
     */
    _getTechnicalLimits : function()
    {
      return {
        minWidth : 0,
        maxWidth : 32000,
        minHeight : 0,
        maxHeight : 32000
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

      var decoration = this.getDecoration();
      if (decoration)
      {
        var inset = decoration.getInsets();

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
      COMPUTED LAYOUT
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
      return this._computedLayout || null;
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
      var computed = this._computedLayout;
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
      var decoration = this.getDecoration();
      if (decoration) {
        decoration.update(this, this._decorationElement, width, height);
      }

      qx.ui2.core.DecorationQueue.remove(this);
    },






    /*
    ---------------------------------------------------------------------------
      PRELIMINARY ELEMENT INTERFACES
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the (container) HTML element.
     *
     * @return {qx.html.Element} The container HTML element
     */
    getElement : function() {
      return this._containerElement;
    },

    /**
     * Sets the inner HTML of the content element.
     *
     * @param html {String} The new inner HTML string.
     */
    setHtml : function(html) {
      this._contentElement.setAttribute("html", html);
    },


    /**
     * Get the content element's inner HTML.
     *
     * @return {String} The inner HTML string
     */
    getHtml : function() {
      return this._contentElement.getAttribute("html");
    },


    /**
     * Sets the DOM element id of the widget's container element.
     *
     * @param id {String} The new id.
     */
    setId : function(id) {
      this._containerElement.setAttribute("id", id);
    },


    /**
     * Gets the DOM element id of the widget's container element.
     *
     * @return {String} The id.
     */
    getId : function() {
      this._containerElement.getAttribute("id");
    },

    _applyBackgroundColor : function(value) {
      this._containerElement.setStyle("backgroundColor", value);
    },

    // overridden
    setParent : function(parent)
    {
      this.base(arguments, parent);
      qx.ui2.core.DisplayQueue.add(this);
    },







    /*
    ---------------------------------------------------------------------------
      VISIBILITY
    ---------------------------------------------------------------------------
    */

    /** {Boolean} Whether the child is displayed currently */
    _displayed : false,


    /**
     * Shows the widget by resetting the display (CSS) properties of the widget's
     * container element.
     */
    _show : function()
    {
      if (!this._isLocallyVisible)
      {
        // fallback to prototype value 'true'
        delete this._isLocallyVisible;

        this._containerElement.show();
      }
    },


    /**
     * Hides the widget by setting the display (CSS) properties of the widget's
     * container element to <code>none</code>.
     */
    _hide : function()
    {
      if (this._isLocallyVisible)
      {
        this._isLocallyVisible = false;
        this._containerElement.hide();
      }
    },


    // property apply
    _applyVisibility : function(value, old)
    {
      var isLayoutVisible = this.isLayoutVisible();

      if (value == "visible")
      {
        if (isLayoutVisible) {
          this._show();
        }
      }
      else
      {
        this._hide();
      }

      // only force a layout update if visibility change from/to "exclude"
      if (old == "excluded" || value == "excluded")
      {
        var parent = this._parent;

        if (parent)
        {
          var parentLayout = parent.getLayout();
          if (parentLayout) {
            parentLayout.changeChildVisibility(this, value);
          }

          parent.scheduleLayoutUpdate();
        }
      }

      qx.ui2.core.DisplayQueue.add(this);
    },


    // property apply
    _applyLayoutVisible : function(value, old)
    {
      var userVisibility = this.getVisibility();
      if (value && userVisibility == "visible") {
        this._show();
      } else {
        this._hide();
      }

      qx.ui2.core.DisplayQueue.add(this);
    },


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
     * This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is visible
     */
    isVisible : function() {
      return this.getVisibility() === "visible";
    },


    /**
     * Whether the widget is locally hidden.
     *
     * This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is hidden
     */
    isHidden : function() {
      return this.getVisibility() === "hidden";
    },


    /**
     * Whether the widget is locally excluded.
     *
     * This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is excluded
     */
    isExcluded : function() {
      return this.getVisibility() === "excluded";
    },






    /*
    ---------------------------------------------------------------------------
      HTML ELEMENT MANAGEMENT
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
      return el;
    },






    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /** {Map} Event which are dispatched on the container/content element */
    _eventTarget :
    {
      container :
      {
        // mouse events
        mousemove : 1,
        mouseover : 1,
        mouseout : 1,
        mousedown : 1,
        mouseup : 1,
        click : 1,
        dblclick : 1,
        contextmenu : 1,
        mousewheel : 1,

        // key events
        keyup : 1,
        keydown : 1,
        keypress : 1,
        keyinput : 1,

        // focus events (do bubble)
        focusin : 1,
        focusout : 1,
        beforedeactivate : 1,
        beforeactivate : 1,
        activate : 1,
        deactivate : 1
      },

      content :
      {
        // focus, blur events (do not bubble)
        focus : 1,
        blur : 1,

        // all elements
        select : 1,

        // input elements
        change : 1,
        input : 1,

        // iframe elements
        load : 1
      }
    },

    // overridden
    addListener : function(type, func, obj)
    {
      var target = this._eventTarget;

      if (target.content[type]) {
        this._contentElement.addListener(type, func, obj);
      } else if (target.container[type]) {
        this._containerElement.addListener(type, func, obj);
      } else {
        this.base(arguments, type, func, obj);
      }
    },


    // overridden
    removeListener : function(type, func, obj)
    {
      var target = this._eventTarget;

      if (target.content[type]) {
        this._contentElement.removeListener(type, func, obj);
      } else if (target.container[type]) {
        this._containerElement.removeListener(type, func, obj);
      } else {
        this.base(arguments, type, func, obj);
      }
    },






    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * generic property apply method for layout relevant properties
     */
    _applyLayoutChange : function() {
      this.scheduleLayoutUpdate();
    },


    // property apply
    _applyDecoration : function(value, old) {
      qx.ui2.decoration.DecorationManager.getInstance().connect(this._styleDecoration, this, value);
    },

    _defaultDecorationInsets : {
      top : 0, right : 0, bottom : 0, left : 0
    },


    /**
     * Callback for decoration manager connection
     *
     * @param decoration {qx.ui2.decoration.IDecoration} the decoration object
     */
    _styleDecoration : function(decoration)
    {
      var old = this._lastDecorationInsets || this._defaultDecorationInsets;
      var current = decoration ? decoration.getInsets() : this._defaultDecorationInsets;

      // Detect inset changes
      if (old.top != current.top || old.right != current.right || old.bottom != current.bottom || old.left != current.left)
      {
        // Create copy and store for next modification.
        this._lastDecorationInsets = qx.lang.Object.copy(current);

        // Inset changes requires a layout update
        qx.ui2.core.LayoutQueue.add(this);
      }
      else
      {
        // Style changes are happy with a simple decoration update
        qx.ui2.core.DecorationQueue.add(this);
      }
    },


    // property apply
    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },


    _styleTextColor : function(value)
    {
      if (value) {
        this._containerElement.setStyle("color", value);
      } else {
        this._containerElement.resetStyle("color");
      }
    },


    // property apply
    _applyLayout : function(value, old)
    {
      if (value) {
        value.setWidget(this);
      }
    },


    // property apply
    _applyEnabled : function(value, old)
    {
      // TODO: implement me!
    }
  },






  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {


  }
});
