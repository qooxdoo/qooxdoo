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
 * TODOC: give a high level overview over widget.
 *
 * A widget consits of at least three DOM elements. The container element, which is
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
  extend : qx.core.Object,

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
    scroll : "qx.event.type.Dom",
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
     * Controls the widget's visibility. Valid values are:
     *
     * <ul>
     *   <li><b>show</b>: Render the widget</li>
     *   <li><b>hide</b>: Hide the widget but don't relayout the widget's parent.</li>
     *   <li>
     *     <b>exclude</b>: Hide the widget and relayout the parent as if the
     *       widget was not a child of its parent.
     *   </li>
     * </ul>
     */
    visibility :
    {
      check : ["show", "hide", "exclude"],
      init : "show",
      apply : "_applyVisibility",
      event : "changeVisibility",
      nullable : false
    },


    /**
     * If the layout manager decides not ot render the widget it should turn
     * if its visibility using this property.
     *
     * @internal
     */
    layoutVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyLayoutVisible",
      nullable : false
    }
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Map} Event which are dispatched on the outer/content element */
    _eventHints :
    {
      outer :
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
        scroll : 1,
        select : 1,

        // input elements
        change : 1,
        input : 1,

        // iframe elements
        load : 1
      }
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

    /**
     * Used by the layouters to apply coordinates and dimensions.
     *
     * @type member
     * @internal Only for layout managers
     * @param left {Integer} Any integer value for the left position,
     *   always in pixels
     * @param top {Integer} Any integer value for the top position,
     *   always in pixels
     * @param width {Integer} Any positive integer value for the width,
     *   always in pixels
     * @param height {Integer} Any positive integer value for the height,
     *   always in pixels
     * @return {void}
     */
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

      /*
      if (locationChange) {
        this.debug("Location change: " + left +", " + top + " " + this);
      }

      if (sizeChange) {
        this.debug("Size change: " + width + ", " + height + " " + this);
      }
      */

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

      // TODO: after doing the layout fire change events
    },


    /**
     * Whether the widget is a layout root. If the widget is a layout root,
     * layout changes inside the widget will not be propagated up to the
     * layout root's parent.
     *
     * @internal
     * @return {Boolean} Whether the widget is a layout root.
     */
    isLayoutRoot : function() {
      return false;
    },


    /**
     * Get the widget's nesting level. Top level widgets have a nesting level
     * of <code>0</code>.
     *
     * @internal
     * @return {Integer} The widgets nesting level.
     */
    getNestingLevel : function()
    {
      var level = -1;
      var parent = this;

      while (parent)
      {
        level += 1;
        parent = parent._parent;
      }

      return level;
    },


    /**
     * {Boolean} whether the widget is a root widget and directly connected to
     * the DOM.
     */
    _isRootWidget : false,


    /**
     * Returns the root widget. The root widget is the widget which
     * is directly inserted into an existing DOM node at HTML level.
     * This is often the BODY element of a typical web page.
     *
     * @internal
     * @type member
     * @return {qx.ui2.core.Widget|null} The root widget (if available)
     */
    getRoot : function()
    {
      var parent = this;

      while (parent)
      {
        if (parent._isRootWidget) {
          return parent;
        }

        parent = parent._parent;
      }

      return null;
    },


    /**
     * Indicate that the widget has layout changes and propagate this information
     * up the widget hierarchy.
     *
     * @internal
     * @type member
     */
    scheduleLayoutUpdate : function() {
      qx.ui2.core.LayoutQueue.add(this);
    },


    /**
     * Whether the layout of this widget (to layout the children)
     * is valid.
     *
     * @internal
     * @type member
     * @return {Boolean} Returns <code>true</code>
     */
    hasValidLayout : function() {
      return this._hasValidLayout == true;
    },


    /**
     * Called by the layout manager to mark this widget's layout as invalid.
     * This function should clear all layout relevant caches.
     *
     * @internal
     */
    invalidateLayoutCache : function()
    {
      this.debug("Mark widget layout invalid: " + this);
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

    /**
     * Returns the recommended dimensions of the widget.
     *
     * Developer note: This method normally does not need to be refined. If you
     * develop a custom widget please customize {@link #_getContentHint} instead.
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


    /**
     * Whether a widget is able to stretch on the x-axis. Some specific y-axis
     * oriented widgets may overwrite this e.g. ToolBarSeparator, ...
     *
     * Please note: This property is not overwritable by the widget user. It
     * may only be refined in a derived class. This way it gives the original
     * widget author the full control regarding flex grow/shrinking used by some
     * layout managers.
     *
     * The user can limit the stretching through the definition of a min- or
     * max-width. If these limits are reached the result of this function is
     * ignored.
     *
     * @type member
     * @return {Boolean} Whether the widget is able to stretch on the x-axis.
     */
    canStretchX : function() {
      return true;
    },


    /**
     * Whether a widget is able to stretch on the y-axis. Some specific x-axis
     * oriented widgets may overwrite this e.g. TextField, Spinner, ComboBox, ...
     *
     * Please note: This property is not overwritable by the widget user. It
     * may only be refined in a derived class. This way it gives the original
     * widget author the full control regarding flex grow/shrinking used by some
     * layout managers.
     *
     * The user can limit the stretching through the definition of a min- or
     * max-height. If these limits are reached the result of this function is
     * ignored.
     *
     * @type member
     * @return {Boolean} Whether the widget is able to stretch on the y-axis.
     */
    canStretchY : function() {
      return true;
    },





    /*
    ---------------------------------------------------------------------------
      INSET CALCULATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Return the insets of the widget's inner element relative to its
     * outer element. The inset is the sum of the padding and border width.
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
     * the layout manager. This function will return <code>null</code> if the
     * layout is invalid.
     *
     * This function is guaranteed to return a non <code>null</code> value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map|null} The widget location and dimensions in pixel (or
     *    <code>null</code> if the layout is invalid). Contains the keys
     *    <code>width</code>, <code>height</code>, <code>left</code> and
     *    <code>top</code>.
     */
    getComputedLayout : function() {
      return this._hasValidLayout ? this._computedLayout : null;
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
      HTML ELEMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the (outer) HTML element.
     *
     * @return {qx.html.Element} The outer HTML element
     */
    getElement : function() {
      return this._containerElement;
    },





    /*
    ---------------------------------------------------------------------------
      HIERARCHY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget's parent widget. Even if the widget has been added to a
     * layout, the parent is always a child of the containing widget. The parent
     * widget may be <code>null</code>.
     *
     * @return {qx.ui2.core.Widget|null} The widget's parent.
     */
    getParent : function() {
      return this._parent;
    },


    /**
     * Set the widget's parent
     *
     * @internal: Should only be used by the layout managers
     * @param parent {qx.ui2.core.Widget|null} The widget's new parent.
     */
    setParent : function(parent) {
      this._parent = parent;
    },







    /*
    ---------------------------------------------------------------------------
      PRELIMINARY ELEMENT INTERFACES
    ---------------------------------------------------------------------------
    */

    setHtml : function(value) {
      this._contentElement.setAttribute("html", value);
    },

    getHtml : function(value) {
      return this._contentElement.getAttribute("html");
    },

    setId : function(value) {
      this._containerElement.setAttribute("id", value);
    },

    getId : function(value) {
      this._containerElement.getAttribute("id");
    },

    _applyBackgroundColor : function(value) {
      this._containerElement.setStyle("backgroundColor", value);
    },




    /*
    ---------------------------------------------------------------------------
      VISIBILITY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyVisibility : function(value, old)
    {
      var isLayoutVisible = this.isLayoutVisible();

      if (value == "show")
      {
        if (isLayoutVisible) {
          this._containerElement.show();
        }
      }
      else
      {
        this._containerElement.hide();
      }

      // only force a layout update if visibility change from/to "exclude"
      if (old == "exclude" || value == "exclude")
      {
        var parent = this.getParent();
        if (parent) {
          parent.scheduleLayoutUpdate();
        }
      } else {
        qx.ui2.core.QueueManager.scheduleFlush();
      }
    },


    // property apply
    _applyLayoutVisible : function(value, old)
    {
      var userVisibility = this.getVisibility();
      if (value && userVisibility == "show") {
        this._containerElement.show();
      } else {
        this._containerElement.hide();
      }
      qx.ui2.core.QueueManager.scheduleFlush();
    },


    /**
     * Check recursively whether the widget and all of its parent widgets
     * are visible.
     *
     * @return {Boolean} Whether the widget and all of its parent widgets are visible.
     */
    isVisible : function()
    {
      var parent = this;

      while (parent)
      {
        if (
          !parent._containerElement.isIncluded() ||
          parent.getVisibility() !== "show"
        ) {
          return false;
        }
        parent = parent._parent;
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      HTML ELEMENT MANAGEMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Create the widget's outer HTML element.
     *
     * @return {qx.html.Element} The outer HTML element
     */
    _createContainerElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyle("position", "absolute");

      return el;
    },


    /**
     * Create the widget's outer HTML element.
     *
     * @return {qx.html.Element} The outer HTML element
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

    // overridden
    addListener : function(type, func, obj)
    {
      var hints = this.self(arguments)._eventHints;

      if (hints.content[type]) {
        this._contentElement.addListener(type, func, obj);
      } else if (hints.outer[type]) {
        this._containerElement.addListener(type, func, obj);
      } else {
        this.base(arguments, type, func, obj);
      }
    },


    // overridden
    removeListener : function(type, func, obj)
    {
      var hints = this.self(arguments)._eventHints;

      if (hints.content[type]) {
        this._contentElement.removeListener(type, func, obj);
      } else if (hints.outer[type]) {
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

    // generic property apply method for all layout relevant properties
    _applyLayoutChange : function()
    {
      this.scheduleLayoutUpdate();
    },


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

    _applyLayout : function(value, old)
    {
      if (value) {
        value.setWidget(this);
      }
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
