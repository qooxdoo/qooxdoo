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
    // mouse events
    mousemove : "qx.event.type.Mouse",
    mouseover : "qx.event.type.Mouse",
    mouseout : "qx.event.type.Mouse",
    mousedown : "qx.event.type.Mouse",
    mouseup : "qx.event.type.Mouse",
    click : "qx.event.type.Mouse",
    dblclick : "qx.event.type.Mouse",
    contextmenu : "qx.event.type.Mouse",
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

    minWidth :
    {
      apply : "_applyLayoutChange",
      init : "auto",
      themeable : true
    },

    width :
    {
      init : "auto",
      apply : "_applyLayoutChange",
      themeable : true
    },

    maxWidth :
    {
      apply : "_applyLayoutChange",
      init : 32000,
      themeable : true
    },

    minHeight :
    {
      apply : "_applyLayoutChange",
      init : "auto",
      themeable : true
    },

    height :
    {
      apply : "_applyLayoutChange",
      init : "auto",
      themeable : true
    },

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
      MARGIN
    ---------------------------------------------------------------------------
    */

    /**
     * The minimum space between the widget's outer border and sibling widgets (top).
     * Not all layout manager respect this property.
     */
    marginTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * The minimum space between the widget's outer border and sibling widgets (right).
     * Not all layout manager respect this property.
     */
    marginRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * The minimum space between the widget's outer border and sibling widgets (bottom).
     * Not all layout manager respect this property.
     */
    marginBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * The minimum space between the widget's outer border and sibling widgets (left).
     * Not all layout manager respect this property.
     */
    marginLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * The 'margin' property is a shorthand property for setting 'marginTop',
     * 'marginRight', 'marginBottom' and 'marginLeft' at the same time.
     *
     * If four values are specified they apply to top, right, bottom and left respectively.
     * If there is only one value, it applies to all sides, if there are two or three,
     * the missing values are taken from the opposite side.
     */
    margin :
    {
      group : [ "marginTop", "marginRight", "marginBottom", "marginLeft" ],
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
    /**
     * Used by the layouters to apply coordinates and dimensions.
     *
     * @type member
     * @internal Only for layout managers
     * @param left {Integer} Any positive integer value for the left position,
     *   always in pixels
     * @param top {Integer} Any positive integer value for the top position,
     *   always in pixels
     * @param width {Integer} Any positive integer value for the width,
     *   always in pixels
     * @param height {Integer} Any positive integer value for the height,
     *   always in pixels
     * @return {void}
     */
    layout : function(left, top, width, height)
    {
      var locationChange = (left !== this._left || top !== this._top);
      var sizeChange = (width !== this._width || height !== this._height);

      if (locationChange)
      {
        this._left = left;
        this._top = top;

        this._outerElement.setStyle("left", left + "px");
        this._outerElement.setStyle("top", top + "px");
      }

      // Scrollbars are applied to the content element and does not influence
      // its outer size.
      var insetTop = this.getInsetTop();
      var insetLeft = this.getInsetLeft();
      var insetRight = this.getInsetRight();
      var insetBottom = this.getInsetBottom();

      var innerWidth = width - insetLeft - insetRight;
      var innerHeight = height - insetTop - insetBottom;

      if (sizeChange)
      {
        this._width = width;
        this._height = height;

        this._outerElement.setStyle("width", width + "px");
        this._outerElement.setStyle("height", height + "px");

        var innerLeft = insetLeft;
        var innerTop = insetTop;

        this._contentElement.setStyle("left", innerLeft + "px");
        this._contentElement.setStyle("top", innerTop + "px");
        this._contentElement.setStyle("width", innerWidth + "px");
        this._contentElement.setStyle("height", innerHeight + "px");
      }

      // Sync style
      // TODO: do style updates in a different queue
      this._syncDecoration(width, height);

      // TODO: after doing the layout fire change events
      if (locationChange) {
        this.debug("Location change: " + left +", " + top + " " + this);
      }

      if (sizeChange) {
        this.debug("Size change: " + width + ", " + height + " " + this);
      }

      // if the current layout is invalid force a relayout even if the size
      // has not changed
      if (!this.isLayoutValid() || sizeChange)
      {
        var mgr = this.getLayout();
        if (mgr) {
          mgr.layout(innerWidth, innerHeight);
        }
      }

      this.markLayoutValid();
    },


    /**
     * Update the decoration (background, border, ...)
     *
     * @param width {Integer} The widget's current width
     * @param height {Integer} The widget's current height
     */
    _syncDecoration : function(width, height)
    {
      var decoration = this.getDecoration();
      if (decoration) {
        var decorationHtml = decoration.getHtml(this, width, height);
        this._decorationElement.setAttribute("html", decorationHtml);
      }
    },


    /**
     * Returns the (outer) HTML element.
     *
     * @return {qx.html.Element} The outer HTML element
     */
    getElement : function() {
      return this._outerElement;
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


    /**
     * Indicate that the widget has layout changes and propagate this information
     * up the widget hierarchy.
     */
    invalidateLayout : function() {
      qx.ui2.core.LayoutQueue.add(this);
    },

    isLayoutValid : function() {
      return this._layoutInvalid !== true;
    },


    /**
     * Called by the layout manager to mark this widget's layout as invalid.
     * This function should clear all layout relevant caches.
     *
     * @internal
     */
    invalidate : function()
    {
      this.debug("Mark widget layout invalid: " + this);
      this._layoutInvalid = true;
      var mgr = this.getLayout();
      if (mgr) {
        mgr.invalidate();
      }
    },


    /**
     * After doing the layout, mark the layout as valid.
     *
     * @internal
     */
    markLayoutValid : function()
    {
      this._layoutInvalid = false;
    },


    // generic property apply method for all layout relevant properties
    _applyLayoutChange : function()
    {
      this.invalidateLayout();
    },


    // TODO: dbugging code
    toString : function()
    {
      var str = this.base(arguments);
      var color = this.getBackgroundColor();
      if(color) {
        str += " (" + color + ")";
      }
      return str;
    },


    // Maybe rename to show/hide?
    exclude : function() {
      this._outerElement.exclude();
    },

    include : function() {
      this._outerElement.include();
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






    /*
    ---------------------------------------------------------------------------
      HINTS
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
      this.invalidateLayout();

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
      this.invalidateLayout();

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
      THEMEABLE PROPERTIES
    ---------------------------------------------------------------------------
    */

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
      if (this._oldWidth && this._oldHeight) {
        this._syncDecoration(this._oldWidth, this._oldHeight);
      }

      qx.ui2.core.LayoutQueue.add(this);
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






    /*
    ---------------------------------------------------------------------------
      INSET
    ---------------------------------------------------------------------------
    */

    getInsetLeft : function()
    {
      var value = this.getPaddingLeft();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetLeft();
      }

      return value;
    },

    getInsetTop : function()
    {
      var value = this.getPaddingTop();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetTop();
      }

      return value;
    },

    getInsetRight : function()
    {
      var value = this.getPaddingRight();

      if (this.getDecoration()) {
        value += this.getDecoration().getInsetRight();
      }

      return value;
    },

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
      LAYOUT
    ---------------------------------------------------------------------------
    */

    _applyLayout : function(value, old)
    {
      if (value) {
        value.setWidget(this);
      }
    },






    /*
    ---------------------------------------------------------------------------
      SIZE HINTS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the widgets dimensions and possible ranges of these.
     *
     * @type member
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function()
    {
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
            minWidth = contentHint.width + insetX;
          }

          if (maxWidth === "auto") {
            maxWidth = contentHint.maxWidth + insetX;
          } else if (maxWidth === "pref") {
            maxWidth = contentHint.width + insetX;
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
            minHeight = contentHint.height + insetY;
          }

          if (maxHeight === "auto") {
            maxHeight = contentHint.maxHeight + insetY;
          } else if (maxHeight === "pref") {
            maxHeight = contentHint.height + insetY;
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
      return hint;
    },


    /**
     * Computes the technical size limitations and preferences of the content.
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

    _supportsContentHint : function()
    {
      var layout = this.getLayout();
      if (layout) {
        return layout.supportsSizeHint();
      }

      return true;
    },





    /*
    ---------------------------------------------------------------------------
      TECHNICAL LIMITS
    ---------------------------------------------------------------------------
    */

    _getTechnicalMinWidth : function() {
      return 0;
    },

    _getTechnicalMaxWidth : function() {
      return 32000;
    },

    _getTechnicalMinHeight : function() {
      return 0;
    },

    _getTechnicalMaxHeight : function() {
      return 32000;
    },





    /*
    ---------------------------------------------------------------------------
      FLEX POLICY
    ---------------------------------------------------------------------------
    */

    canStretchX : function() {
      return true;
    },

    canStretchY : function() {
      return true;
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
