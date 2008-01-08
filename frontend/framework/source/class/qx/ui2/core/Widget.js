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

/**
 * This is the base class for all widgets.
 *
 * TODOC: give a high level overview over widget.
 *
 * A widget consits of at least three DOM elements. The outer element, which is
 * added to the parent widget has two child Element: The "decoration" and the
 * "inner" element. The decoration element has a lower z-Index and contains
 * markup to render the widget's backround and border using an implementation
 * of {@link qx.ui2.decoration.IDecoration}.The inner element is positioned
 * inside the "outer" element to respect paddings and contains the "real"
 * widget element.
 *
 *  <pre>
 * -outer----------------
 * |                    |
 * |  -decoration----   |
 * |  | -inner------|-  |
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
    this._outerElement = this._createOuterElement();
    this._decorationElement = this._createDecorationElement();
    this._contentElement = this._createContentElement();

    // Layout data
    this._layoutProperties = {};
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
     * The background color of the rendered widget.
     */
    backgroundColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBackgroundColor",
      event : "changeBackgroundColor",
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
      var innerWidth = width - this.getInsetLeft() - this.getInsetRight();
      var innerHeight = height - this.getInsetTop() - this.getInsetBottom();

      var locationChange = (left !== this._left || top !== this._top);
      if (locationChange)
      {
        this._left = left;
        this._top = top;

        this._outerElement.setStyle("left", left + "px");
        this._outerElement.setStyle("top", top + "px");
      }

      var sizeChange = (width !== this._width || height !== this._height);
      if (sizeChange)
      {
        this._width = width;
        this._height = height;

        this._outerElement.setStyle("width", width + "px");
        this._outerElement.setStyle("height", height + "px");

        this._contentElement.setStyle("left", this.getInsetLeft() + "px");
        this._contentElement.setStyle("top", this.getInsetTop() + "px");
        this._contentElement.setStyle("width", innerWidth + "px");
        this._contentElement.setStyle("height", innerHeight + "px");

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
        if (mgr) {
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
     * @return {Boolean} Whether the widget is a layout root.
     */
    isLayoutRoot : function() {
      return false;
    },


    /**
     * Get the widget's nesting level. Top level widgets have a nesting level
     * of <code>0</code>.
     *
     * @return {Integer} The widgets nesting level.
     */
    getNestingLevel : function()
    {
      var level = 0;
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
     */
    scheduleLayoutUpdate : function() {
      qx.ui2.core.LayoutQueue.add(this);
    },

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
      LAYOUT PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a layout property.
     *
     * @internal
     * @type member
     * @param name {String} Name of the property (width, top, minHeight, ...)
     * @param value {var} Any acceptable value (depends on the selected parent layout manager)
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    addLayoutProperty : function(name, value)
    {
      this._layoutProperties[name] = value;
      this.scheduleLayoutUpdate();

      return this;
    },


    /**
     * Removes a layout property.
     *
     * @internal
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    removeLayoutProperty : function(name)
    {
      delete this._layoutProperties[name];
      this.scheduleLayoutUpdate();

      return this;
    },


    /**
     * Returns the value of a specific property
     *
     * @internal
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {var|null} Configured value
     */
    getLayoutProperty : function(name)
    {
      var value = this._layoutProperties[name];
      return value == null ? null : value;
    },


    /**
     * Whether this widget has a specific property
     *
     * @internal
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {Boolean} <code>true</code> when this hint is defined
     */
    hasLayoutProperty : function(name) {
      return this._layoutProperties[name] != null;
    },


    /**
     * Remove all layout properties. This happens, when the widget
     * if removed from a layout.
     *
     * @internal
     * @type member
     */
    hasLayoutProperty : function(name) {
      this._layoutProperties = {};
    },





    /*
    ---------------------------------------------------------------------------
      SIZE HINTS
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
      var insetX = this.getInsetLeft() + this.getInsetRight();
      var insetY = this.getInsetTop() + this.getInsetBottom();


      // Read properties
      var width = this.getWidth();
      var minWidth = this.getMinWidth();
      var maxWidth = this.getMaxWidth();
      var height = this.getHeight();
      var minHeight = this.getMinHeight();
      var maxHeight = this.getMaxHeight();


      // Cache content hint
      var contentHint = this._getContentHint();

      if (!contentHint)
      {
        if (width === "auto" || height === "auto") {
          throw new Error("Auto sizing is not supported by the content!");
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
      minWidth = Math.max(insetX, minWidth, this._getTechnicalMinWidth());
      maxWidth = Math.min(32000, maxWidth, this._getTechnicalMaxWidth());




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
      minHeight = Math.max(insetY, minHeight, this._getTechnicalMinHeight());
      maxHeight = Math.min(32000, maxHeight, this._getTechnicalMaxHeight());




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
      if (layout) {
        return layout.getSizeHint();
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






    /*
    ---------------------------------------------------------------------------
      TECHNICAL LIMITS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the technical minimum width of this widget.
     *
     * Developer note: This method should be overwritten by derived classes
     * to define the minimum width which keeps the widget usable.
     * This may be for example, that at least the icon and 2 characters of a
     * tab view button are viewable etc. The dimension given here is not
     * refinable by the widget users and give the widget author a good
     * way to integrate a hard-coded technical minimum width.
     *
     * @type member
     * @return {Integer} Minimum width
     */
    _getTechnicalMinWidth : function() {
      return 0;
    },


    /**
     * Returns the technical maximum width of this widget.
     *
     * Developer note: This method should be overwritten by derived classes
     * to define the maximum width which keeps the widget usable. This
     * is often not as needed as the technical minimum width, but may be useful,
     * as well in some cases. The dimension given here is not
     * refinable by the widget users and give the widget author a good
     * way to integrate some hard-coded technical maximum width.
     *
     * @type member
     * @return {Integer} Minimum width
     */
    _getTechnicalMaxWidth : function() {
      return 32000;
    },


    /**
     * Returns the technical minimum height of this widget.
     *
     * Developer note: This method should be overwritten by derived classes
     * to define the minimum height which keeps the widget usable.
     * This may be for example, that at least the height of the text or icon
     * used by the widget. The dimension given here is not
     * refinable by the widget users and give the widget author a good
     * way to integrate some hard-coded technical minimum height.
     *
     * @type member
     * @return {Integer} Minimum width
     */
    _getTechnicalMinHeight : function() {
      return 0;
    },


    /**
     * Returns the technical maximum height of this widget.
     *
     * Developer note: This method should be overwritten by derived classes
     * to define the maximum height which keeps the widget usable. This
     * is often not as needed as the technical minimum height, but may be useful,
     * as well in some cases. The dimension given here is not
     * refinable by the widget users and give the widget author a good
     * way to integrate some hard-coded technical maximum width.
     *
     * @type member
     * @return {Integer} Minimum width
     */
    _getTechnicalMaxHeight : function() {
      return 32000;
    },





    /*
    ---------------------------------------------------------------------------
      FLEX POLICY
    ---------------------------------------------------------------------------
    */

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
     * Return the left inset of the widget's inner element relative to its
     * outer element. The inset is the sum of the padding and border width.
     *
     * @return {Integer} The left inset
     */
    getInsetLeft : function()
    {
      var value = this.getPaddingLeft();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetLeft();
      }

      return value;
    },


    /**
     * Return the top inset of the widget's inner element relative to its
     * outer element. The inset is the sum of the padding and border width.
     *
     * @return {Integer} The top inset
     */
    getInsetTop : function()
    {
      var value = this.getPaddingTop();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetTop();
      }

      return value;
    },


    /**
     * Return the right inset of the widget's inner element relative to its
     * outer element. The inset is the sum of the padding and border width.
     *
     * @return {Integer} The right inset
     */
    getInsetRight : function()
    {
      var value = this.getPaddingRight();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetRight();
      }

      return value;
    },


    /**
     * Return the bottom inset of the widget's inner element relative to its
     * outer element. The inset is the sum of the padding and border width.
     *
     * @return {Integer} The bottom inset
     */
    getInsetBottom : function()
    {
      var value = this.getPaddingBottom();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetBottom();
      }

      return value;
    },






    /*
    ---------------------------------------------------------------------------
      COMPUTED LAYOUT DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget's top position inside its parent element as computed by
     * the layout manager. This function will return <code>null</code> if the
     * layout is invalid.
     *
     * This function is guaranteed to return a non <code>null</code> value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     *  @type member
     *  @return {Integer|null} The widget's top position in pixel or
     *      <code>null</code> if the layout is invalid.
     */
    getComputedTop : function() {
      return this._hasValidLayout ? this._top : null;
    },


    /**
     * Get the widget's left position inside its parent element as computed by
     * the layout manager. This function will return <code>null</code> if the
     * layout is invalid.
     *
     * This function is guaranteed to return a non <code>null</code> value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     *  @type member
     *  @return {Integer|null} The widget's left position in pixel or
     *      <code>null</code> if the layout is invalid.
     */
    getComputedLeft : function() {
      return this._hasValidLayout ? this._left : null;
    },


    /**
     * Get the widget's width as computed by the layout manager. This function
     * will return <code>null</code> if the layout is invalid.
     *
     * This function is guaranteed to return a non <code>null</code> value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     *  @type member
     *  @return {Integer|null} The widget's width in pixel or
     *      <code>null</code> if the layout is invalid.
     */
    getComputedWidth : function() {
      return this._hasValidLayout ? this._width : null;
    },


    /**
     * Get the widget's height as computed by the layout manager. This function
     * will return <code>null</code> if the layout is invalid.
     *
     *  This function is guaranteed to return a non <code>null</code> value
     *  during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     *  @type member
     *  @return {Integer|null} The widget's height in pixel or
     *      <code>null</code> if the layout is invalid.
     */
    getComputedHeight : function() {
      return this._hasValidLayout ? this._height : null;
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
      return this._outerElement;
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
      this._outerElement.setAttribute("id", value);
    },

    getId : function(value) {
      this._outerElement.getAttribute("id");
    },

    exclude : function() {
      this._outerElement.exclude();
    },

    include : function() {
      this._outerElement.include();
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
    _createOuterElement : function()
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

      this._outerElement.add(el);

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
      this._outerElement.add(el);

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
        this._outerElement.addListener(type, func, obj);
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
        this._outerElement.removeListener(type, func, obj);
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


    /**
     * Callback for decoration manager connection
     *
     * @param decoration {qx.ui2.decoration.IDecoration} the decoration object
     */
    _styleDecoration : function(decoration)
    {
      var insetTop=0, insetRight=0, insetBottom=0, insetLeft=0;

      // Read out decoration inset
      if (decoration)
      {
        insetTop = decoration.getInsetTop();
        insetRight = decoration.getInsetRight();
        insetBottom = decoration.getInsetBottom();
        insetLeft = decoration.getInsetLeft();
      }

      // Detect inset changes
      if (insetTop != this._insetTop || insetRight != this._insetRight || insetBottom != this._insetBottom || insetLeft != this._insetLeft)
      {
        // Store new insets
        this._insetTop = insetTop;
        this._insetRight = insetRight;
        this._insetBottom = insetBottom;
        this._insetLeft = insetLeft;

        // Inset changes requires a layout update
        qx.ui2.core.LayoutQueue.add(this);
      }
      else
      {
        // Style changes are happy with a simple decoration update
        qx.ui2.core.DecorationQueue.add(this);
      }
    },


    _applyBackgroundColor : function(value, old)
    {
      var decoration = this.getDecoration();
      if(decoration !== null) {
        this._styleDecoration();
      }
    },


    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },

    _styleTextColor : function(value)
    {
      if (value) {
        this._outerElement.setStyle("color", value);
      } else {
        this._outerElement.resetStyle("color");
      }
    },


    _applyLayout : function(value, old)
    {
      if (value) {
        value.setWidget(this);
      }
    },






    /*
    ---------------------------------------------------------------------------
      STUFF
    ---------------------------------------------------------------------------
    */

    // TODO: debugging code
    toString : function()
    {
      var str = this.base(arguments);
      var color = this.getBackgroundColor();
      if(color) {
        str += " (" + color + ")";
      }
      return str;
    }
  },






  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});
