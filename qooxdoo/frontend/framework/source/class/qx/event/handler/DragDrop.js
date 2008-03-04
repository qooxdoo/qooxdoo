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
 * Event handler, which supports drag events on DOM elements.
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
    /** {Map} all supported events */
    __eventTypes : {
      "dragstart": true,
      "dragmove": true,
      "dragstop": true
    },

    /** {Map} information about all dragable DOM elements */
    __draggableElements : null,


    /**
     * Enable drag events for the given element
     *
     * @param element {Element} DOM element to enable drag events for
     * @param minDragOffset {Integer} The minimum amount of pixel the curser has
     *     to move from the drag start position before drag events are fired.
     */
    __enableDragEvents : function(element, minDragOffset)
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


    /**
     * Disable the drag events for the given element
     *
     * @param element {Element} the DOM element to disable drag events for.
     */
    __disableDragEvents : function(element)
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
        this.__enableDragEvents(target, 1);
      }
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var elementKey = qx.core.ObjectRegistry.toHashCode(target);
      var dragData = this.__draggableElements[elementKey];

      if (dragData)
      {
        var removeDragEvents = true;
        for (var dragtype in this.__eventTypes)
        {
          if (dragtype == "type") {
            continue;
          }
          if (this._manager.hasListeners(target, dragtype, capture)) {
            removeDragEvents = false;
            break;
          }
        }
        if (removeDragEvents) {
          this.__disableDragEvents(target);
        }
      }
    },


    /**
     * Creates a drag event object from a mouse event
     *
     * @param type {String} the event type (name)
     * @param mouseEvent {qx.event.type.Mouse} The mouse event the drag event
     *     should be based on
     * @param dragOffsetLeft {Integer} The difference between the current left mouse
     *     position and the mouse position at drag start.
     * @param dragOffsetTop {Integer} The difference between the current top mouse
     *     position and the mouse position at drag start.
     * @return {qx.event.type.Drag} The configure drag event
     */
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


    /**
     * Mouse down event handler
     *
     * @param dragData {Map} the current drag session
     * @param e {qx.event.type.Mouse} The mouse down event object
     */
    _onMousedown : function(dragData, e)
    {
      qx.bom.Element.capture(dragData.element);
      this._manager.addListener(dragData.element, "mousemove", dragData.mousemoveHandler);

      dragData.dragStartLeft = e.getDocumentLeft();
      dragData.dragStartTop = e.getDocumentTop();
      dragData.dragStartEvent = this.__createDragEvent("dragstart", e, 0, 0);
      dragData.dragStarted = false;
    },


    /**
     * The loose capture event handler
     *
     * @param dragData {Map} the current drag session
     * @param e {qx.event.type.Event} The loose capture event object
     */
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


    /**
     * Mouse up event handler
     *
     * @param dragData {Map} the current drag session
     * @param e {qx.event.type.Mouse} The mouse up event object
     */
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


    /**
     * Mouse move event handler
     *
     * @param dragData {Map} the current drag session
     * @param e {qx.event.type.Mouse} The mouse move event object
     */
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