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

    this._children = [];
    this._childContainer = this;

    this._outerElement = this._createOuterElement();
    this._innerElement = this._createInnerElement();
    this._borderElement = null;

    this._outerElement.add(this._innerElement);

    this._outerElement.setStyle("position", "absolute");
    this._innerElement.setStyle("position", "absolute");

    this._innerElement.setAttribute("z-index", 10);
    this._innerElement.setStyle("overflow", "hidden");
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

    scroll : "qx.event.type.Dom"
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
      POSITION PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * The distance from the outer left border to the parent's left edge.
     */
    left :
    {
      check : "Integer",
      init : 0,
      apply : "_applyOuterPixel",
      event : "changeLeft"
    },


    /**
     * The distance from the outer right border to the parent's right edge.
     */
    top :
    {
      check : "Integer",
      init : 0,
      apply : "_applyOuterPixel",
      event : "changeTop"
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSION PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * The width of the widget (including padding and border).
     */
    width :
    {
      check : "Integer",
      init : 100,
      apply : "_applyWidth",
      event : "changeWidth"
    },


    /**
     * The height of the widget (including padding and border).
     */
    height :
    {
      check : "Integer",
      init : 100,
      apply : "_applyHeight",
      event : "changeHeight"
    },




    /*
    ---------------------------------------------------------------------------
      PADDING PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Padding of the widget (top) */
    paddingTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyHeight",
      themeable : true
    },


    /** Padding of the widget (right) */
    paddingRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyHeight",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth",
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
      BORDER PROPERTIES
    ---------------------------------------------------------------------------
    */

    borderRenderer :
    {
      check : "qx.ui2.border.IBorderRenderer",
      nullable : true,
      init : null,
      apply : "_applyBorderRenderer",
      themeable : true
    },


    borderData :
    {
      check : "Map",
      nullable : true,
      apply : "_applyBorderData",
      event : "changeBorderData",
      themeable : true
    },


    /*
    ---------------------------------------------------------------------------
      COLOR PROPERTIES
    ---------------------------------------------------------------------------
    */

    color :
    {
      check : "String",
      apply : "_applyOuterStyle",
      themeable : true
    },

    backgroundColor :
    {
      check : "String",
      apply : "_applyBackgroundColor",
      themeable : true
    }
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {


  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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


    /**
     * Return the element representing the widget's border and background. This
     * may be null if no border is set.
     *
     * @return {qx.html.Element} The border HTML element.
     */
    _getBorderElement : function() {
      return this._borderElement;
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
      CHILDREN MANAGEMENT INTERNALS
    ---------------------------------------------------------------------------
    */

    __addChildHelper : function(child)
    {
      this._innerElement.add(child.getElement());
    },

    __removeChildHelper : function(child)
    {
      this._innerElement.remove(child.getElement());
    },

    __moveChildHelper : function(child)
    {

    },





    /*
    ---------------------------------------------------------------------------
      PROTECTED API
      CHILDREN MANAGEMENT (EXECUTED ON THE PARENT)
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the internal children structure.
     *
     * @type member
     * @return {Array} the children list
     */
    _getChildren : function() {
      return this._children;
    },


    /**
     * Find the position of the given child
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the child
     * @return {Integer} returns the position. If the element
     *     is not a child <code>-1</code> will be returned.
     */
    _indexOf : function(child) {
      return this._children.indexOf(child);
    },


    /**
     * Whether the given widget is a child of this widget.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the child
     * @return {Boolean} Returns <code>true</code> when the given
     *    element is a child of this widget.
     */
    _hasChild : function(child) {
      return this._children.indexOf(child) !== -1;
    },


    /**
     * Append all given children at the end of this widget.
     *
     * @type member
     * @param childs {qx.ui2.core.Widget...} elements to insert
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _add : function(childs)
    {
      if (arguments[1])
      {
        for (var i=0, l=arguments.length; i<l; i++) {
          this.__addChildHelper(arguments[i]);
        }

        this._children.push.apply(this._children, arguments);
      }
      else
      {
        this.__addChildHelper(childs);
        this._children.push(childs);
      }

      // Chaining support
      return this;
    },


    /**
     * Inserts a new element into this widget at the given position.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the element to insert
     * @param index {Integer} the index (starts at 0 for the
     *     first child) to insert (the index of the following
     *     children will be increased by one)
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _addAt : function(child, index)
    {
      this.__addChildHelper(child);
      qx.lang.Array.insertAt(this._children, child, index);

      // Chaining support
      return this;
    },


    /**
     * Removes all given children
     *
     * @type member
     * @param childs {qx.ui2.core.Widget...} children to remove
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _remove : function(childs)
    {
      if (arguments[1])
      {
        var child;
        for (var i=0, l=arguments.length; i<l; i++)
        {
          child = arguments[i];

          this.__removeChildHelper(child);
          qx.lang.Array.remove(this._children, child);
        }
      }
      else
      {
        this.__removeChildHelper(childs);
        qx.lang.Array.remove(this._children, childs);
      }

      // Chaining support
      return this;
    },


    /**
     * Removes the child at the given index
     *
     * @type member
     * @param index {Integer} the position of the
     *     child (starts at 0 for the first child)
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _removeAt : function(index)
    {
      var child = this._children[index];

      if (!child) {
        throw new Error("Has no child at this position!");
      }

      this.__removeChildHelper(child);
      qx.lang.Array.removeAt(this._children, index);

      // Chaining support
      return this;
    },


    /**
     * Remove all children from this widget.
     *
     * @type member
     * @return
     */
    _removeAll : function()
    {
      var children = this._children;
      for (var i=0, l=children.length; i<l; i++) {
        this.__removeChildHelper(children[i]);
      }

      // Clear array
      children.length = 0;

      // Chaining support
      return this;
    },






    /*
    ---------------------------------------------------------------------------
      PROTECTED API
      CHILDREN MANAGEMENT (EXECUTED ON THE CHILD)
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the parent of this widget.
     *
     * @type member
     * @return {qx.ui2.core.Widget|null} The parent of this widget
     */
    _getParent : function() {
      return this._parent | null;
    },


    /**
     * Insert self into the given parent. Normally appends self to the end,
     * but optionally a position can be defined. <code>0</code> will insert
     * at the begin.
     *
     * @type member
     * @param parent {qx.ui2.core.Widget} The new parent of this widget
     * @param index {Integer?null} Optional position
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _insertInto : function(parent, index)
    {
      parent.__addChildHelper(this);

      if (index == null) {
        parent._children.push(this);
      } else {
        qx.lang.Array.insertAt(this._children, child, index);
      }

      return this;
    },


    /**
     * Insert self before the given (related) element
     *
     * @type member
     * @param rel {qx.ui2.core.Widget} the related element
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _insertBefore : function(rel)
    {
      var parent = rel._parent;

      parent.__addChildHelper(this);
      qx.lang.Array.insertBefore(parent._children, this, rel);

      return this;
    },


    /**
     * Insert self after the given (related) element
     *
     * @type member
     * @param rel {qx.ui2.core.Widget} the related element
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _insertAfter : function(rel)
    {
      var parent = rel._parent;

      parent.__addChildHelper(this);
      qx.lang.Array.insertAfter(parent._children, this, rel);

      return this;
    },


    /**
     * Move self to the given index in the current parent.
     *
     * @type member
     * @param index {Integer} the index (starts at 0 for the first child)
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     * @throws an exception when the given widget is not child
     *      of this widget.
     */
    _moveTo : function(index)
    {
      var parent = this._parent;

      parent.__moveChildHelper(this);

      var oldIndex = parent._children.indexOf(this);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      } else if (oldIndex < index) {
        index--;
      }

      qx.lang.Array.removeAt(parent._children, oldIndex);
      qx.lang.Array.insertAt(parent._children, this, index);

      return this;
    },


    /**
     * Move self before the given (related) child.
     *
     * @type member
     * @param rel {qx.ui2.core.Widget} the related child
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _moveBefore : function(rel)
    {
      var parent = this._parent;
      return this.moveTo(parent._children.indexOf(rel));
    },


    /**
     * Move self after the given (related) child.
     *
     * @type member
     * @param rel {qx.ui2.core.Widget} the related child
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _moveAfter : function(rel)
    {
      var parent = this._parent;
      return this.moveTo(parent._children.indexOf(rel) + 1);
    },


    /**
     * Remove self from the current parent.
     *
     * @type member
     * @return {qx.ui2.core.Widget} this object (for chaining support)
     */
    _free : function()
    {
      var parent = this._parent;

      if (!parent) {
        throw new Error("Has no parent to remove from.");
      }

      parent.__removeChildHelper(this);
      qx.lang.Array.remove(parent._children, this);

      return this;
    },








    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /** Event which are dispatched on the outer element */
    _outerElementEvents :
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

      // focus events
      focus : 1,
      blur : 1,
      focusin : 1,
      focusout : 1,
      beforedeactivate : 1,
      beforeactivate : 1,
      activate : 1,
      deactivate : 1
    },

    /** Event which are dispatched on the inner element */
    _innerElementEvents :
    {
      scroll : 1
    },


    // overridden
    addListener : function(type, func, obj)
    {
      if (this._innerElementEvents[type])
      {
        this._innerElement.addListener(type, func, obj);
      }
      else if (this._outerElementEvents[type])
      {
        this._outerElement.addListener(type, func, obj);
      }
      else
      {
        this.base(arguments, type, func, obj);
      }
    },


    // overridden
    removeListener : function(type, func, obj)
    {
      if (this._innerElementEvents[type])
      {
        this._innerElement.removeListener(type, func, obj);
      }
      else if (this._outerElementEvents[type])
      {
        this._outerElement.removeListener(type, func, obj);
      }
      else
      {
        this.base(arguments, type, func, obj);
      }
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
    getChildren : function() {
      return this._childContainer._getChildren();
    },


    /**
     * Find the position of the given child
     *
     * @type member
     * @param child {qx.html.Element} the child
     * @return {Integer} returns the position. If the element
     *     is not a child <code>-1</code> will be returned.
     */
    indexOf : function(child) {
      return this._childContainer._indexOf(child);
    },


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


    /**
     * Append all given children at the end of this element.
     *
     * @type member
     * @param childs {qx.html.Element...} elements to insert
     * @return {qx.html.Element} this object (for chaining support)
     */
    add : function(childs)
    {
      var cont = this._childContainer;
      for (var i=0, l=arguments.length; i<l; i++) {
        cont._add(arguments[i]);
      }

      // Chaining support
      return this;
    },


    /**
     * Inserts a new element into this element at the given position.
     *
     * @type member
     * @param child {qx.html.Element} the element to insert
     * @param index {Integer} the index (starts at 0 for the
     *     first child) to insert (the index of the following
     *     children will be increased by one)
     * @return {qx.html.Element} this object (for chaining support)
     */
    addAt : function(child, index)
    {
      this._childContainer._addAt(child, index);

      // Chaining support
      return this;
    },


    /**
     * Removes all given children
     *
     * @type member
     * @param childs {qx.html.Element...} children to remove
     * @return {qx.html.Element} this object (for chaining support)
     */
    remove : function(childs)
    {
      var cont = this._childContainer;
      for (var i=0, l=arguments.length; i<l; i++) {
        cont._remove(arguments[i]);
      }

      // Chaining support
      return this;
    },


    /**
     * Removes the child at the given index
     *
     * @type member
     * @param index {Integer} the position of the
     *     child (starts at 0 for the first child)
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeAt : function(index)
    {
      this._childContainer._removeAt(index);

      // Chaining support
      return this;
    },


    /**
     * Remove all children from this element.
     *
     * @type member
     * @return
     */
    removeAll : function()
    {
      this._childContainer._removeAll();

      // Chaining support
      return this;
    },




    /*
    ---------------------------------------------------------------------------
      PADDING PROPERTIES
    ---------------------------------------------------------------------------
    */

   _applyOuterStyle : function(value, old, name)
   {
     if (value == null) {
       this._outerElement.resetStyle(name);
     } else {
       this._outerElement.setStyle(name, value);
     }
   },


   _applyOuterPixel : function(value, old, propName)
   {
     if (value == null) {
       this._outerElement.resetStyle(propName);
     } else {
       this._outerElement.setStyle(propName, value + "px");
     }
   },


   _applyWidth : function(value, old, name)
   {
     if (name == "width") {
       this._outerElement.setStyle("width", value + "px");
     }
     if (name == "paddingLeft") {
       this._innerElement.setStyle("left", value + "px");
     }
     var innerWidth = this.getWidth() - this.getPaddingLeft() - this.getPaddingRight();
     this._innerElement.setStyle("width", innerWidth + "px");
   },


   _applyHeight : function(value, old, name)
   {
     if (name == "height") {
       this._outerElement.setStyle("height", value + "px");
     }
     if (name == "paddingTop") {
       this._innerElement.setStyle("top", value + "px");
     }
     var innerHeight = this.getHeight() - this.getPaddingTop() - this.getPaddingBottom();
     this._innerElement.setStyle("height", innerHeight + "px");
   },


   _applyBackgroundColor : function(value, old)
   {
     var el = this._borderElement || this._outerElement;
     if (value == null) {
       el.resetStyle("backgroundColor");
     } else {
       el.setStyle("backgroundColor", value);
     }
   },

    /*
    ---------------------------------------------------------------------------
      BORDER PROPERTIES
    ---------------------------------------------------------------------------
    */

   _applyBorderRenderer : function(value, old)
   {
     if (this._borderElement) {
       this._borderElement.free();
       this._borderElement.dispose();
     }

     if (value !== null) {
       this._borderElement = value.createBorderElement(this);
       this._outerElement.add(this._borderElement);
       this._outerElement.setStyle("backgroundColor", null);
     }

     var backgroundColor = this.getBackgroundColor();
     this._applyBackgroundColor(backgroundColor, backgroundColor);
   },


   _applyBorderData : function(value, old)
   {
     if (this.getBorderRenderer() !== null) {
       this.getBorderRenderer().update(this, this._borderElement);
     }
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
