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

    this._outerElement.add(this._innerElement);

  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {


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
      apply : "_applyLeft",
      event : "changeLeft"
    },


    /**
     * The distance from the outer right border to the parent's right edge.
     */
    top :
    {
      check : "Integer",
      init : 0,
      apply : "_applyTop",
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
      apply : "_applyPaddingTop",
      themeable : true
    },


    /** Padding of the widget (right) */
    paddingRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyPaddingRight",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyPaddingBottom",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyPaddingLeft",
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
      apply : "_applyColor",
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
     * Returns the HTML element.
     *
     * @return {qx.html.Element}
     */
    getElement : function() {
      return this._outerElement;
    },

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
      this._innerElement.setAttribute("id", value);
    },

    getId : function(value) {
      this._innerElement.getAttribute("id");
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
      this._childContainer._add(childs);

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
      this._childContainer._remove(childs);

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
      PUBLIC API
      COLOR PROPERTIES
    ---------------------------------------------------------------------------
    */

    _applyColor : function(value, old)
    {
      if (value == null) {
        this._outerElement.resetStyle("color");
      } else {
        this._outerElement.setStyle("color", value);
      }
    },


    _applyBackgroundColor : function(value, old)
    {
      if (value == null) {
        this._outerElement.resetStyle("backgroundColor");
      } else {
        this._outerElement.setStyle("backgroundColor", value);
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
