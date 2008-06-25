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
    this.__droppableElements = {};
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      "dragstart": true,
      "drag": true,
      "dragend": true,
      "dragenter": true,
      "dragleave": true,
      "drop" : true,
      "dragend": true
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {Map} Events dispatched on the dragged element */
    __sourceEventTypes : {
      "dragstart": true,
      "drag": true,
      "dragend": true
    },


    /** {Map} events dispatched on the drag target */
    __targetEventTypes : {
      "dragenter": true,
      "dragleave": true,
      "drop" : true
    },


    __eventTypes :
    {
      "dragstart": true,
      "drag": true,
      "dragenter": true,
      "dragleave": true,
      "drop" : true,
      "dragend": true
    },


    /** {Map} information about all dragable DOM elements */
    __draggableElements : null,


    /** {Map} information about all droppable elements */
   __droppableElements : null,


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
        minDragOffset: minDragOffset == null ? 1 : minDragOffset,
        target: null
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
    canHandleEvent : function(target, type) {},


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var elementKey = qx.core.ObjectRegistry.toHashCode(target);

      if (this.__sourceEventTypes[type])
      {
        var dragData = this.__draggableElements[elementKey];

        if (!dragData) {
          this.__enableDragEvents(target, 1);
        }
      }
      else
      {
        this.__droppableElements[elementKey] = target;
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
          if (dragtype == type) {
            continue;
          }
          if (this._manager.hasListener(target, dragtype, capture)) {
            removeDragEvents = false;
            break;
          }
        }
        if (removeDragEvents)
        {
          if (this.__sourceEventTypes[type]) {
            this.__disableDragEvents(target);
          } else {
            delete this.__droppableElements[elementKey]
          }

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
      dragEvent.setBubbles(true);
      dragEvent.setDragOffsetLeft(dragOffsetLeft);
      dragEvent.setDragOffsetTop(dragOffsetTop);
      return dragEvent;
    },


    __getDroppableFromPoint : function(dropLocations, x, y)
    {
      for (var i=0; i<dropLocations.length; i++)
      {
        var location = dropLocations[i].location;
        if (location.left <= x && location.right >= x && location.top <= y && location.bottom >= y) {
          return dropLocations[i].element;
        }
      }
      return null;
    },


    __getDropLocations : function()
    {
      var locations = [];
      for (var key in this.__droppableElements)
      {
        var el = this.__droppableElements[key];
        var location = qx.bom.element.Location.get(el);

        insertIndex = locations.length;
        for (var i=0; i<locations.length; i++)
        {
          var other = locations[i];
          var otherLocation = other.location;

          if (qx.dom.Hierarchy.contains(other.element, el))
          {
            insertIndex = i;

            if (otherLocation.top > location.top) {
              location.top = otherLocation.top;
            }

            if (otherLocation.right < location.right) {
              location.right = otherLocation.right;
            }

            if (otherLocation.bottom < location.bottom) {
              location.bottom = otherLocation.bottom;
            }

            if (otherLocation.left > location.left) {
              location.left = otherLocation.left;
            }

            if (location.left >= location.right || location.top >= location.bottom)
            {
              insertIndex = -1;
              break;
            }
          }
        }

        if (insertIndex >= 0) {
          qx.lang.Array.insertAt(locations, {
            location: location,
            element: el
          }, insertIndex);
        }

      }




      return locations;
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
      dragData.dropLocations = this.__getDropLocations();
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
        if (dragData.target)
        {
          var dragOffsetLeft = dragData.lastMoveEvent.getDocumentLeft() - dragData.dragStartLeft;
          var dragOffsetTop = dragData.lastMoveEvent.getDocumentTop() - dragData.dragStartTop;

          var dropEvent = this.__createDragEvent("drop", dragData.lastMoveEvent, dragOffsetLeft, dragOffsetTop);
          this._manager.dispatchEvent(dragData.target, dropEvent);
        }

        dragData.lastMoveEvent.setType("dragend");
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

      var dropEvent = this.__createDragEvent("drop", e, dragOffsetLeft, dragOffsetTop);
      this._manager.dispatchEvent(e.getTarget(), dropEvent);

      var stopEvent = this.__createDragEvent("dragend", e, dragOffsetLeft, dragOffsetTop);
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

      var moveEvent = this.__createDragEvent("drag", e, dragOffsetLeft, dragOffsetTop);
      this._manager.dispatchEvent(dragData.element, moveEvent);

      if (dragData.lastMoveEvent) {
        qx.event.Pool.getInstance().poolObject(dragData.lastMoveEvent);
      }
      dragData.lastMoveEvent = moveEvent.clone();


      var target = this.__getDroppableFromPoint(dragData.dropLocations, e.getDocumentLeft(), e.getDocumentTop());

      // dispatch drag leave and drag enter events
      if (dragData.target !== target)
      {
        if (dragData.target)
        {
          var leaveEvent = this.__createDragEvent("dragleave", e, dragOffsetLeft, dragOffsetTop);
          this._manager.dispatchEvent(dragData.target, leaveEvent);
        }

        if (target)
        {
          var enterEvent = this.__createDragEvent("dragenter", e, dragOffsetLeft, dragOffsetTop);
          this._manager.dispatchEvent(target, enterEvent);
        }

        dragData.target = target;
      }
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_window", "_manager", "__draggableElements", "__droppableElements");
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