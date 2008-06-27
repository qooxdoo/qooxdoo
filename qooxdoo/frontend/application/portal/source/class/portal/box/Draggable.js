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
     * Alexander Back (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Implementation of a draggable box
 */
qx.Class.define("portal.box.Draggable",
{
  extend : qx.core.Object,

  /**
   * @param box {portal.box.Box} box instance to decorate
   */
  construct : function(box)
  {
    this.base(arguments);

    this.__box          = box;
    this.__element      = box.getElement();
    this.__handle       = null;
    this.__startOffsets = null;
    
    this.__prepare();
  },

  
  /* ******************************************************
   *    MEMBERS
   * ******************************************************/
  members :
  {
    /**
     * Return the box
     *
     * @type member
     * @return {portal.box.Box} box instance
     */
    getBox : function() {
      return this.__box;
    },
    
    /**
     * Return the element of the box
     * 
     * @type member
     * @return {Element} Element node of the box
     */
    getElement : function()
    {
      return this.__element;
    },


    /**
     * Internal preparation (adding handle)
     *
     * @type member
     * @return {void} 
     */
    __prepare : function()
    {
      this.__createHandle();
      this.__addListener();
    },


    /**
     * Creates the handle to drag the box around.
     *
     * @type member
     * @return {void} 
     */
    __createHandle : function()
    {
      this.__handle = qx.bom.Element.create("div");

      /* Only set the className attribute (CSS is defined seperately) */
      qx.bom.element.Class.add(this.__handle, "dragHandle");
      
      qx.dom.Element.insertBegin(this.__handle, this.__element);
    },


    /**
     * Internal method to add all needed event listener methods
     *
     * @type member
     * @return {void} 
     */
    __addListener : function()
    {
      qx.bom.Element.addListener(this.__handle, "mousedown", this._onMouseDown, this);
      qx.bom.Element.addListener(this.__handle, "mouseover", function(e){
        qx.bom.element.Style.set(this, "cursor", "move");
      }, this.__handle);
      
      qx.bom.Element.addListener(this.__handle, "dragstart", this._onDragStart, this);
      qx.bom.Element.addListener(this.__handle, "dragend", portal.dragdrop.Manager.getInstance().stopSession, portal.dragdrop.Manager.getInstance());
      qx.bom.Element.addListener(this.__handle, "drag", this._onDragMove, this);
    },


    /**
     * Listener method for "mousedown" events.
     * Sets the start offset for the drag and drop session
     * 
     * @type member
     * @param e {qx.event.type.Mouse} mouse event instance
     * @return {void}
     */
    _onMouseDown : function(e)
    {
      if (e.isLeftPressed()) {
        if (qx.core.Variant.isSet("qx.client", "mshtml"))
        {
          var top = qx.bom.element.Location.getTop(this.__element, "margin") - 
                    parseInt(qx.bom.element.Style.get(this.__element, "paddingTop")) -
                    parseInt(qx.bom.element.Style.get(this.__element, "borderTopWidth"));
        }
        else if (qx.core.Variant.isSet("qx.client", "webkit"))
        {
          var top = qx.bom.element.Location.getTop(this.__element, "margin");
        }
        else
        {
          var top = qx.bom.element.Location.getTop(this.__element);
        }
        
        this.__startOffsets = {
          left : e.getDocumentLeft() - qx.bom.element.Location.getLeft(this.__element),
          top  : e.getDocumentTop() - top
        };
      }
    },
    
    
    /**
     * Listener method for "dragStart" event
     *
     * @type member
     * @param e {qx.event.type.Drag} drag event instance
     * @return {void} 
     */
    _onDragStart : function(e)
    {
      if (e.isLeftPressed())
      {
        // set the current box as the active one
        portal.box.Manager.getInstance().setActiveBox(this.__box);
        
        // let the dragDrop manager take control
        portal.dragdrop.Manager.getInstance().startSession(this.__box, this.__startOffsets);
      }
    },
    
    
    /**
     * Listener method for all "drag" events
     * 
     * @type member
     * @param e {qx.event.type.Drag} drag event instance
     * @return {void}
     */
    _onDragMove : function(e)
    {
      // get the needed infos from the event and call the manager
      var left = e.getDocumentLeft();
      var top  = e.getDocumentTop();
      var offsetLeft = e.getDragOffsetLeft(); 
      var offsetTop  = e.getDragOffsetTop();
      
      // with this timeout everything is a little bit smoother
      qx.event.Timer.once(function(){
        this.onDragMove(top, left, offsetLeft, offsetTop);
      }, portal.dragdrop.Manager.getInstance(), 0);
    }
  },
  
  
  /* ******************************************************
   *    DESTRUCT
   * ******************************************************/
  destruct : function() {
    this._disposeFields("__box", "__handle", "__element");
  }
});
