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

    // Where to add the children, too
    // Normally the widget itself, but could also be an inner pane
    // e.g. for windows, groupboxes, comboboxes, etc.
    this._childContainer = this;

    // Create inner element
    this._innerElement = this._createInnerElement();
    this._innerElement.setStyle("position", "absolute");
    this._innerElement.setStyle("zIndex", 10);
    this._innerElement.setStyle("overflow", "hidden");

    // Create outer element
    this._outerElement = this._createOuterElement();
    this._outerElement.add(this._innerElement);
    this._outerElement.setStyle("position", "absolute");

    // Border sizes
    this._borderWidthLeft = 0;
    this._borderWidthTop = 0;
    this._borderWidthRight = 0;
    this._borderWidthBottom = 0;

    // Layout data
    this._layoutHints = {};
    this._layoutChanges = {};

    // Whether the widget has a layout manager
    this._hasLayout = false;
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

    /** Selected layout of instance {@link qx.ui2.layout.AbstractLayout} */
    layout :
    {
      check : "qx.ui2.layout.AbstractLayout",
      nullable : true,
      init : null,
      apply : "_applyLayout"
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
      apply : "_applyYSize",
      themeable : true
    },


    /** Padding of the widget (right) */
    paddingRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyXSize",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyYSize",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyXSize",
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
     * The backgroundColor style property of the rendered widget.
     */
    backgroundColor :
    {
      nullable : true,
      init : null,
      check : "Color",
      apply : "_applyBackgroundColor",
      event : "changeBackgroundColor",
      themeable : true
    },


    /**
     * The color (textColor) style property of the rendered widget.
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
     * The border property describes how to paint the border on the widget.
     */
    border :
    {
      nullable : true,
      init : null,
      apply : "_applyBorder",
      event : "changeBorder",
      check : "Border",
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
    /** {Map} Event which are dispatched on the outer/inner element */
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

      inner :
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
    setGeometry : function(left, top, width, height)
    {
      this._outerElement.setStyle("left", left + "px");
      this._outerElement.setStyle("top", top + "px");
      this._outerElement.setStyle("width", width + "px");
      this._outerElement.setStyle("height", height + "px");

      // Scrollbars are applied to the inner element and does not influence
      // its outer size.
      var insetTop = this.getPaddingTop() + this._borderWidthTop;
      var insetLeft = this.getPaddingLeft() + this._borderWidthLeft;
      var insetRight = this.getPaddingRight() + this._borderWidthRight;
      var insetBottom = this.getPaddingBottom() + this._borderWidthBottom;

      var innerLeft = insetLeft;
      var innerTop = insetTop;
      var innerWidth = width - insetLeft - insetRight;
      var innerHeight = height - insetTop - insetBottom;

      this._innerElement.setStyle("left", innerLeft + "px");
      this._innerElement.setStyle("top", innerTop + "px");
      this._innerElement.setStyle("width", innerWidth + "px");
      this._innerElement.setStyle("height", innerHeight + "px");
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
     * Return the inner element, which contains the widget contents.
     *
     * @return {qx.html.Element} The inner HTML element.
     */
    _getInnerElement : function() {
      return this._innerElement;
    },



    setHtml : function(value) {
      this._innerElement.setAttribute("html", value);
    },

    getHtml : function(value) {
      return this._innerElement.getAttribute("html");
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
     * Adds a layout hint.
     *
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @param value {var} Any acceptable value (depends on the selected parent layout manager)
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    addHint : function(name, value)
    {
      this._layoutHints[name] = value;

      return this;
    },


    /**
     * Removes a layout hint.
     *
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    removeHint : function(name)
    {
      delete this._layoutHints[name];

      return this;
    },


    /**
     * Returns the value of a specific hint
     *
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {var|null} Configured value
     */
    getHint : function(name)
    {
      var value = this._layoutHints[name];
      return value == null ? null : value;
    },


    /**
     * Whether this widget has a specific hint
     *
     * @type member
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {Boolean} <code>true</code> when this hint is defined
     */
    hasHint : function(name) {
      return this._layoutHints[name] != null;
    },


    /**
     * Imports a set of hints. Ideal for initial setup.
     *
     * @type member
     * @param map {Map} Incoming data structure
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    importHints : function(map)
    {
      var hints = this._layoutHints;

      for (var name in map) {
        hints[name] = map[name];
      }

      return this;
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
    _createOuterElement : function() {
      return new qx.html.Element("div");
    },


    /**
     * Create the widget's outer HTML element.
     *
     * @return {qx.html.Element} The outer HTML element
     */
    _createInnerElement : function() {
      return new qx.html.Element("div");
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

      if (hints.inner[type]) {
        this._innerElement.addListener(type, func, obj);
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

      if (hints.inner[type]) {
        this._innerElement.removeListener(type, func, obj);
      } else if (hints.outer[type]) {
        this._outerElement.removeListener(type, func, obj);
      } else {
        this.base(arguments, type, func, obj);
      }
    },






    /*
    ---------------------------------------------------------------------------
      PROTECTED API
      CHILDREN MANAGEMENT (EXECUTED ON THE PARENT)
    ---------------------------------------------------------------------------
    */

/*
    _getChildren : function() {
      return this.getLayout().getChildren();
    },
*/
    _hasChild : function() {
      return this.getLayout().hasChild();
    },




    /*
    ---------------------------------------------------------------------------
      PUBLIC API
      CHILDREN MANAGEMENT (EXECUTED ON THE PARENT)
    ---------------------------------------------------------------------------
    */

    /**
     * Returns a copy of the internal children structure.
     *
     * @type member
     * @return {Array} the children list
     */
    /*
    getChildren : function() {
      return this._childContainer._getChildren();
    },
*/

    /**
     * Whether the given element is a child of this element.
     *
     * @type member
     * @param child {qx.html.Element} the child
     * @return {Boolean} Returns <code>true</code> when the given
     *    element is a child of this element.
     */
    hasChild : function(child) {
      return this._childContainer._hasChild(child);
    },






    /*
    ---------------------------------------------------------------------------
      THEMEABLE PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** apply routine for property {@link #border} */
    _applyBorder : function(value, old) {
      qx.theme.manager.Border.getInstance().connect(this._styleBorder, this, value);
    },

    _styleBorder : function(value) {
      // TODO
    },



    _applyBackgroundColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBackgroundColor, this, value);
    },

    _styleBackgroundColor : function(value)
    {
      if (value) {
        this._outerElement.setStyle("backgroundColor", value);
      } else {
        this._outerElement.resetStyle("backgroundColor");
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
      LAYOUT
    ---------------------------------------------------------------------------
    */

    _applyLayout : function(value, old)
    {
      this._hasLayout = (value !== null);

      if (value)
      {
        var children = value.getChildren();
        for (var i=0, l=children.length; i<l; i++)
        {
          this._innerElement.add(children[i].getElement());
        }
      }
    },

/*
    invalidateLayout : function()
    {
      var widget = this;

      this._layoutValid =
    },


    isLayoutValid : function() {
      return this._layoutValid;
    }
*/



    /*
    ---------------------------------------------------------------------------
      PREFERRED SIZE
    ---------------------------------------------------------------------------
    */

    /**
     * The natural way the content would display if no dimensions are applied.
     *
     * For labels and other HTML content this is the simple size of this content.
     * For images the size of the image (without scaling).
     *
     * For children the preferred width of each children positioned in the selected
     * layout when each children has no own dimensions configured.
     *
     * @type member
     * @return {Integer} The preferred content width, always in pixels
     */
    _getPreferredContentWidth : function()
    {
      return 20; // TODO
    },


    /**
     * The natural way the content would display if no dimensions are applied.
     *
     * For labels and other HTML content this is the simple size of this content.
     * For images the size of the image (without scaling).
     *
     * For children the preferred height of each children positioned in the selected
     * layout when each children has no own dimensions configured.
     *
     * @type member
     * @return {Integer} The preferred content height, always in pixels
     */
    _getPreferredContentHeight : function()
    {
      return 10; // TODO
    },


    /**
     * The preferred width of this widget (simulates the case
     * when no layout properties have been applied at all)
     *
     * @type member
     * @return {Integer} The preferred width, always in pixels
     */
    getPreferredWidth : function()
    {
      return this._getPreferredContentWidth() +
        this.getPaddingLeft() + this.getPaddingRight() +
        this._borderWidthLeft + this._borderWidthRight;
    },


    /**
     * The preferred height of this widget (simulates the case
     * when no layout properties have been applied at all)
     *
     * @type member
     * @return {Integer} The preferred height, always in pixels
     */
    getPreferredHeight : function()
    {
      return this._getPreferredContentHeight() +
        this.getPaddingTop() + this.getPaddingBottom() +
        this._borderWidthTop + this._borderWidthBottom;
    },





    /*
    ---------------------------------------------------------------------------
      MINIMUM SIZE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the minimum width the content is able to shrink.
     *
     * Normally this depends on the technical minimums of the
     * children or the content in general (HTML, images, ...)
     *
     * @type member
     * @return {Integer} The minimum technical content width, always in pixels
     */
    _getTechnicalMinimumContentWidth : function()
    {
      return 0; //TODO
    },


    /**
     * Returns the minimum height the content is able to shrink.
     *
     * Normally this depends on the technical minimums of the
     * children or the content in general (HTML, images, ...)
     *
     * @type member
     * @return {Integer} The minimum technical content height, always in pixels
     */
    _getTechnicalMinimumContentHeight : function()
    {
      return 0; //TODO
    },


    /**
     * Returns the minium width of the widget
     *
     * This is the minimum content width plus paddings and borders.
     *
     * @type member
     * @return {Integer} The minimum technical width, always in pixels
     */
    getTechnicalMinimumWidth : function()
    {
      return this._getTechnicalMinimunContentWidth() +
        this.getPaddingLeft() + this.getPaddingRight() +
        this._borderWidthLeft + this._borderWidthRight;
    },


    /**
     * Returns the minium height of the widget
     *
     * This is the minimum content height plus paddings and borders.
     *
     * @type member
     * @return {Integer} The minimum technical height, always in pixels
     */
    getTechnicalMinimumHeight : function()
    {
      return this._getTechnicalMinimumContentHeight() +
        this.getPaddingTop() + this.getPaddingBottom() +
        this._borderWidthTop + this._borderWidthBottom;
    },







    /*
    ---------------------------------------------------------------------------
      MAXIMUM SIZE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the maximum width the content is able to grow.
     *
     * Normally this depends on the technical maximums of the
     * children or the content in general (HTML, images, ...)
     *
     * @type member
     * @return {Integer} The maximum technical content width, always in pixels
     */
    _getTechnicalMaximumContentWidth : function()
    {
      return 100; //TODO
    },


    /**
     * Returns the maximum height the content is able to grow.
     *
     * Normally this depends on the technical maximums of the
     * children or the content in general (HTML, images, ...)
     *
     * @type member
     * @return {Integer} The maximum technical content height, always in pixels
     */
    _getTechnicalMaximumContentHeight : function()
    {
      return 100; //TODO
    },


    /**
     * Returns the minium width of the widget
     *
     * This is the maximum content width plus paddings and borders.
     *
     * @type member
     * @return {Integer} The maximum technical width, always in pixels
     */
    getTechnicalMaximumWidth : function()
    {
      return this._getTechnicalMinimunContentWidth() +
        this.getPaddingLeft() + this.getPaddingRight() +
        this._borderWidthLeft + this._borderWidthRight;
    },


    /**
     * Returns the minium height of the widget
     *
     * This is the maximum content height plus paddings and borders.
     *
     * @type member
     * @return {Integer} The maximum technical height, always in pixels
     */
    getTechnicalMaximumHeight : function()
    {
      return this._getTechnicalMaximumContentHeight() +
        this.getPaddingTop() + this.getPaddingBottom() +
        this._borderWidthTop + this._borderWidthBottom;
    },











    /*
    ---------------------------------------------------------------------------
      SIZE POLICY
    ---------------------------------------------------------------------------
    */










    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES
    ---------------------------------------------------------------------------
    */

    _applyXSize : function(value, old, name)
    {
      this._layoutChanges[name] = true;

    },

    _applyYSize : function(value, old, name)
    {
      this._layoutChanges[name] = true;

    },

    _applyXPosition : function(value, old, name)
    {
      this._layoutChanges[name] = true;

    },

    _applyYPosition : function(value, old, name)
    {
      this._layoutChanges[name] = true;

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
