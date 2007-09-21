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

    _getChildren : function() {
      return this.getLayout().getChildren();
    },

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
    getChildren : function() {
      return this._childContainer._getChildren();
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


   _applyOuterPixelStyle : function(value, old, propName)
   {
     if (value == null) {
       this._outerElement.resetStyle(propName);
     } else {
       this._outerElement.setStyle(propName, value + "px");
     }
   },


   _applyBackgroundColor : function(value, old)
   {
     var el = this._borderElement || this._outerElement;

     if (value == null) {
       el.resetStyle("backgroundColor");
     } else {
       el.setStyle("backgroundColor", value);
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
