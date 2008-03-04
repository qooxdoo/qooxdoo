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
 *
 */
qx.Class.define("qx.event.handler.DragDrop",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this._manager = manager;
    this._window = manager.getWindow();

    this.__draggableElements = {};
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __eventTypes : {
      "dragstart": true,
      "dragmove": true,
      "dragstop": true
    },

    __draggableElements : null,


    enableDragEvents : function(element, minDragOffset)
    {
      var dragData = {
        element: element,
        minDragOffset: minDragOffset == null ? 1 : minDragOffset
      }

      dragData.mousedownHandler = qx.lang.Function.bind(this._onMousedown, this, dragData);
      dragData.mouseupHandler = qx.lang.Function.bind(this._onMouseup, this, dragData);
      dragData.mousemoveHandler = qx.lang.Function.bind(this._onMousemove, this, dragData);
      dragData.loosecaptureHandler = qx.lang.Function.bind(this._onLoosecapture, this, dragData);

      var elementKey = qx.core.ObjectRegistry.toHashCode(element);
      this.__draggableElements[elementKey] = dragData;

      this._manager.addListener(element, "mousedown", dragData.mousedownHandler);
      this._manager.addListener(element, "mouseup", dragData.mouseupHandler);
      this._manager.addListener(element, "losecapture", dragData.loosecaptureHandler);
    },


    disableDragEvents : function(element)
    {
      var elementKey = qx.core.ObjectRegistry.toHashCode(element);
      dragData = this.__draggableElements[elementKey];

      if (!dragData) {
        return;
      }

      this._manager.removeListener(element, "mousedown", dragData.mousedownHandler);
      this._manager.removeListener(element, "mouseup", dragData.mouseupHandler);
      this._manager.removeListener(element, "mousemove", dragData.mousemoveHandler);
      this._manager.removeListener(element, "losecapture", dragData.loosecaptureHandler);
      delete(this.__draggableElements[elementKey]);
    },


    // interface implementation
    canHandleEvent : function(target, type) {
      return this.__eventTypes[type];
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var elementKey = qx.core.ObjectRegistry.toHashCode(target);
      var dragData = this.__draggableElements[elementKey];

      if (!dragData) {
        throw new Error("Dragging is not enabled on this element! Please enable dragging using the 'initDraggable' method");
      }
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    __createDragEvent : function(type, mouseEvent, dragOffsetLeft, dragOffsetTop)
    {
      var dragEvent = qx.event.Pool.getInstance().getObject(qx.event.type.Drag);
      mouseEvent.clone(dragEvent);
      dragEvent.setType(type);
      dragEvent.setBubbles(false);
      dragEvent.setDragOffsetLeft(dragOffsetLeft);
      dragEvent.setDragOffsetTop(dragOffsetTop);
      return dragEvent;
    },


    _onMousedown : function(dragData, e)
    {
      qx.bom.Element.capture(dragData.element);
      this._manager.addListener(dragData.element, "mousemove", dragData.mousemoveHandler);

      dragData.dragStartLeft = e.getDocumentLeft();
      dragData.dragStartTop = e.getDocumentTop();
      dragData.dragStartEvent = this.__createDragEvent("dragstart", e, 0, 0);
      dragData.dragStarted = false;
    },


    _onLoosecapture : function(dragData, e)
    {
      this._manager.removeListener(dragData.element, "mousemove", dragData.mousemoveHandler);

      if (!dragData.dragStarted) {
        return;
      }
      dragData.dragStarted = false;

      if (dragData.lastMoveEvent)
      {
        dragData.lastMoveEvent.setType("dragstop");
        this._manager.dispatchEvent(dragData.element, dragData.lastMoveEvent);
        dragData.lastMoveEvent = null;
      }
    },


    _onMouseup : function(dragData, e)
    {
      qx.bom.Element.releaseCapture(dragData.element);
      this._manager.removeListener(dragData.element, "mousemove", dragData.mousemoveHandler);

      if (!dragData.dragStarted) {
        return;
      }
      dragData.dragStarted = false;

      var dragOffsetLeft = e.getDocumentLeft() - dragData.dragStartLeft;
      var dragOffsetTop = e.getDocumentTop() - dragData.dragStartTop;

      var stopEvent = this.__createDragEvent("dragstop", e, dragOffsetLeft, dragOffsetTop);
      this._manager.dispatchEvent(dragData.element, stopEvent);
    },


    _onMousemove : function(dragData, e)
    {
      var dragOffsetLeft = e.getDocumentLeft() - dragData.dragStartLeft;
      var dragOffsetTop = e.getDocumentTop() - dragData.dragStartTop;

      if (!dragData.dragStarted)
      {
        if (
          Math.abs(dragOffsetLeft) >= dragData.minDragOffset ||
          Math.abs(dragOffsetTop) >= dragData.minDragOffset
        )
        {
          dragData.dragStarted = true;
          dragData.dragStartEvent.setDragOffsetLeft(0);
          dragData.dragStartEvent.setDragOffsetTop(0);
          this._manager.dispatchEvent(dragData.element, dragData.dragStartEvent);
        }
      }

      if (!dragData.dragStarted) {
        return;
      }

      var moveEvent = this.__createDragEvent("dragmove", e, dragOffsetLeft, dragOffsetTop);
      this._manager.dispatchEvent(dragData.element, moveEvent);

      if (dragData.lastMoveEvent) {
        qx.event.Pool.getInstance().poolObject(dragData.lastMoveEvent);
      }
      dragData.lastMoveEvent = moveEvent.clone();
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__draggableElements");
  },


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});