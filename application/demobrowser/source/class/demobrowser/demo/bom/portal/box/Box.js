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
     * Alexander Steitz (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Base implementation of a box
 */
qx.Class.define("demobrowser.demo.bom.portal.box.Box",
{
  extend : qx.core.Object,


  /**
   * @param boxData {Map} meta data of the box
   * @param element {Node} DOM-Element which represents the box
   * @param styles {Map} Additional style attributes to apply
   * @param groupBoxId {String} Id of the groupBox this box is part of
   */
  construct : function(boxData, element, styles, groupBoxId)
  {
    this.base(arguments);

    /* Set/initialize instance variables */
    this.__boxData = boxData;
    this.__id      = boxData.id;

    if (element != null)
    {
      // set inital width and height
      qx.bom.element.Style.set(element, "width", boxData.width);
      qx.bom.element.Style.set(element, "height", boxData.height);

      /* Prepare the box */
      this.__prepare(element, styles);
    }
    this.setElement(element);
    this.setGroupBoxId(groupBoxId);

    this.__resizableComponent = null;
    this.__draggableComponent = null;

    /* Add the resizable feature if available */
    if (boxData.resizable)
    {
      this.setResizable(true);

      var options =
      {
        minWidth  : parseInt(boxData.minWidth),
        minHeight : parseInt(boxData.minHeight),
        maxWidth  : parseInt(boxData.maxWidth),
        maxHeight : parseInt(boxData.maxHeight),
        handles   : boxData.resizeHandles
      };

      this.__resizableComponent = new demobrowser.demo.bom.portal.box.Resizable(this, options);
    }

    /* Add the draggable feature if available */
    if (boxData.draggable)
    {
      this.setDraggable(true);
      this.__draggableComponent = new demobrowser.demo.bom.portal.box.Draggable(this);
    }

    /* add content */
    this.__addContent();
  },


  /* ******************************************************
   *    PROPERTIES
   * ******************************************************/
  properties :
  {
    /** DOM element of the box */
    element : { init : null },

    /** Id of GroupBox */
    groupBoxId :
    {
      init  : null,
      check : "String"
    },

    /** Active state */
    active :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyActive"
    },

    /** Whether the box is resizable */
    resizable :
    {
      check : "Boolean",
      init  : false
    },

    /** Whether the box is draggable */
    draggable :
    {
      check : "Boolean",
      init  : false
    }
  },


  /* ******************************************************
   *    MEMBERS
   * ******************************************************/
  members :
  {
    __id : null,
    __boxData : null,
    __draggableComponent : null,
    __resizableComponent : null,

    /**
     * Apply method for the "active" property
     *
     * @param value {Boolean} new value
     * @param old {Boolean} old value
     * @return {void}
     */
    _applyActive : function(value, old)
    {
      if (value)
      {
        qx.bom.element.Style.set(this.getElement(), "border", "1px solid orange");
      }
      else
      {
        qx.bom.element.Style.set(this.getElement(), "border", "1px solid #444444");
      }
    },

    /* ******************************************
     *          FOUNDATION METHODS
     * ****************************************** */


    /**
     * Returns the id of the box.
     *
     * @return {String ? null} id of the box or null
     */
    getId : function() {
      return this.getElement() ? this.getElement().id : null;
    },


    /**
     * Returns the data of the box.
     *
     * @return {Map} data of the box.
     */
    getData : function() {
      return this.__boxData;
    },


    /**
     * Returns the draggable component if the box is capable of this feature
     *
     * @return {demobrowser.demo.bom.portal.box.Draggable} draggable instance or null
     */
    getDraggableComponent : function() {
      return this.__draggableComponent;
    },


    /**
     * Returns the resizable component if the box is capable of this feature
     *
     * @return {demobrowser.demo.bom.portal.box.Resizable} resizable instance or null
     */
    getResizableComponent : function() {
      return this.__resizableComponent;
    },


    /**
     * Prepare the box element itself.
     *
     * @param element {Node} element node to prepare
     * @param styles {Map} Additional style attributes to apply
     * @return {void}
     */
    __prepare : function(element, styles)
    {
      if (styles)
      {
        for (var style in styles) {
          qx.bom.element.Style.set(style, styles[style]);
        }
      }

      // setup
      qx.bom.element.Style.set(element, "position", "relative");
      qx.bom.element.Style.set(element, "zIndex", 0);

      // add listeners
      qx.bom.Element.addListener(element, "click", this.__onSelect, this, true);
    },


    /***
     * Default content
     *
     * @return {void}
     */
    __addContent : function()
    {
      var text = "This is a demo application showing the low-level capabilities." +
                 " It does contain no UI widget code at all.";
      text = text + "<br/><br/>" + text + "<br/><br/>" + text;

      var box = qx.dom.Element.create("div", { "class" : "box_content" });
      box.innerHTML = text;

      qx.dom.Element.insertEnd(box, this.getElement());
    },


    /**
     * Listener which informs the box manager about the selection
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     * @return {void}
     */
    __onSelect : function(e) {
      demobrowser.demo.bom.portal.box.Manager.getInstance().setActiveBox(this);
    }
  },


  /* ******************************************************
   *    DESTRUCT
   * ******************************************************/
  destruct : function()
  {
    this.resetElement();
    this.__boxData = this.__resizableComponent = this.__draggableComponent = null;
  }
});
