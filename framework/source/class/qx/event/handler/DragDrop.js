/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event handler, which supports drag events on DOM elements.
 *
 * @require(qx.event.handler.Gesture)
 * @require(qx.event.handler.Keyboard)
 * @require(qx.event.handler.Capture)
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
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this.__manager = manager;
    this.__root = manager.getWindow().document.documentElement;

    // Initialize listener
    this.__manager.addListener(this.__root, "longtap", this._onLongtap, this);
    this.__manager.addListener(this.__root, "pointerdown", this._onPointerdown, this, true);

    qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this);

    // Initialize data structures
    this.__rebuildStructures();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      dragstart : 1,
      dragend : 1,
      dragover : 1,
      dragleave : 1,
      drop : 1,
      drag : 1,
      dragchange : 1,
      droprequest : 1
    },

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,

    /**
     * Array of strings holding the names of the allowed mouse buttons
     * for Drag & Drop. The default is "left" but could be extended with
     * "middle" or "right"
     */
    ALLOWED_BUTTONS: ["left"],


    /**
     * The distance needed to change the mouse position before a drag session start.
     */
    MIN_DRAG_DISTANCE : 5
  },


  properties : {
    /**
     * Widget instance of the drag & drop cursor. If non is given, the default
     * {@link qx.ui.core.DragDropCursor} will be used.
     */
    cursor : {
      check : "qx.ui.core.Widget",
      nullable : true,
      init : null
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __manager : null,
    __root : null,
    __dropTarget : null,
    __dragTarget : null,
    __types : null,
    __actions : null,
    __keys : null,
    __cache : null,
    __currentType : null,
    __currentAction : null,
    __sessionActive : false,
    __validDrop : false,
    __validAction : false,
    __dragTargetWidget : null,
    __startConfig : null,


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {},


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },





    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Registers a supported type
     *
     * @param type {String} The type to add
     */
    addType : function(type) {
      this.__types[type] = true;
    },

    /**
     * Registers a supported action. One of <code>move</code>,
     * <code>copy</code> or <code>alias</code>.
     *
     * @param action {String} The action to add
     */
    addAction : function(action) {
      this.__actions[action] = true;
    },


    /**
     * Whether the current drag target supports the given type
     *
     * @param type {String} Any type
     * @return {Boolean} Whether the type is supported
     */
    supportsType : function(type) {
      return !!this.__types[type];
    },


    /**
     * Whether the current drag target supports the given action
     *
     * @param type {String} Any type
     * @return {Boolean} Whether the action is supported
     */
    supportsAction : function(type) {
      return !!this.__actions[type];
    },

    /**
     * Whether the current drop target allows the current drag target.
     *
     * @param isAllowed {Boolean} False if a drop should be disallowed
     */
    setDropAllowed : function(isAllowed) {
      this.__validDrop = isAllowed;
      this.__detectAction();
    },

    /**
     * Returns the data of the given type during the <code>drop</code> event
     * on the drop target. This method fires a <code>droprequest</code> at
     * the drag target which should be answered by calls to {@link #addData}.
     *
     * @param type {String} Any supported type
     * @return {var} The result data
     */
    getData : function(type)
    {
      if (!this.__validDrop || !this.__dropTarget) {
        throw new Error("This method must not be used outside the drop event listener!");
      }

      if (!this.__types[type]) {
        throw new Error("Unsupported data type: " + type + "!");
      }

      if (!this.__cache[type])
      {
        this.__currentType = type;
        this.__fireEvent("droprequest", this.__dragTarget, this.__dropTarget, false);
      }

      if (!this.__cache[type]) {
        throw new Error("Please use a droprequest listener to the drag source to fill the manager with data!");
      }

      return this.__cache[type] || null;
    },


    /**
     * Returns the currently selected action (by user keyboard modifiers)
     *
     * @return {String} One of <code>move</code>, <code>copy</code> or
     *    <code>alias</code>
     */
    getCurrentAction : function() {
      this.__detectAction();
      return this.__currentAction;
    },


    /**
     * Returns the widget which has been the target of the drag start.
     * @return {qx.ui.core.Widget} The widget on which the drag started.
     */
    getDragTarget : function() {
      return this.__dragTargetWidget;
    },


    /**
     * Adds data of the given type to the internal storage. The data
     * is available until the <code>dragend</code> event is fired.
     *
     * @param type {String} Any valid type
     * @param data {var} Any data to store
     */
    addData : function(type, data) {
      this.__cache[type] = data;
    },


    /**
     * Returns the type which was requested last.
     *
     * @return {String} The last requested data type
     */
    getCurrentType : function() {
      return this.__currentType;
    },


    /**
     * Returns if a drag session is currently active
     *
     * @return {Boolean} active drag session
     */
    isSessionActive : function() {
      return this.__sessionActive;
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Rebuilds the internal data storage used during a drag&drop session
     */
    __rebuildStructures : function()
    {
      this.__types = {};
      this.__actions = {};
      this.__keys = {};
      this.__cache = {};
    },


    /**
     * Detects the current action and stores it under the private
     * field <code>__currentAction</code>. Also fires the event
     * <code>dragchange</code> on every modification.
     */
    __detectAction : function()
    {
      if (this.__dragTarget == null) {
        return;
      }

      var actions = this.__actions;
      var keys = this.__keys;
      var current = null;

      if (this.__validDrop)
      {
        if (keys.Shift && keys.Control && actions.alias) {
          current = "alias";
        } else if (keys.Shift && keys.Alt && actions.copy) {
          current = "copy";
        } else if (keys.Shift && actions.move) {
          current = "move";
        } else if (keys.Alt && actions.alias) {
          current = "alias";
        } else if (keys.Control && actions.copy) {
          current = "copy";
        } else if (actions.move) {
          current = "move";
        } else if (actions.copy) {
          current = "copy";
        } else if (actions.alias) {
          current = "alias";
        }
      }

      var old = this.__currentAction;
      if (current != old) {

        if (this.__dropTarget) {
          this.__currentAction = current;
          this.__validAction = this.__fireEvent("dragchange", this.__dropTarget, this.__dragTarget, true);
          if (!this.__validAction) {
            current = null;
          }
        }

        if (current != old) {
          this.__currentAction = current;
          this.__fireEvent("dragchange", this.__dragTarget, this.__dropTarget, false);
        }
      }
    },


    /**
     * Wrapper for {@link qx.event.Registration#fireEvent} for drag&drop events
     * needed in this class.
     *
     * @param type {String} Event type
     * @param target {Object} Target to fire on
     * @param relatedTarget {Object} Related target, i.e. drag or drop target
     *    depending on the drag event
     * @param cancelable {Boolean} Whether the event is cancelable
     * @param original {qx.event.type.Pointer} Original pointer event
     * @return {Boolean} <code>true</code> if the event's default behavior was
     * not prevented
     */
    __fireEvent : function(type, target, relatedTarget, cancelable, original)
    {
      var Registration = qx.event.Registration;
      var dragEvent = Registration.createEvent(type, qx.event.type.Drag, [ cancelable, original ]);

      if (target !== relatedTarget) {
        dragEvent.setRelatedTarget(relatedTarget);
      }

      return Registration.dispatchEvent(target, dragEvent);
    },


    /**
     * Finds next draggable parent of the given element. Maybe the element itself as well.
     *
     * Looks for the attribute <code>qxDraggable</code> with the value <code>on</code>.
     *
     * @param elem {Element} The element to query
     * @return {Element} The next parent element which is draggable. May also be <code>null</code>
     */
    __findDraggable : function(elem)
    {
      while (elem && elem.nodeType == 1)
      {
        if (elem.getAttribute("qxDraggable") == "on") {
          return elem;
        }

        elem = elem.parentNode;
      }

      return null;
    },


    /**
     * Finds next droppable parent of the given element. Maybe the element itself as well.
     *
     * Looks for the attribute <code>qxDroppable</code> with the value <code>on</code>.
     *
     * @param elem {Element} The element to query
     * @return {Element} The next parent element which is droppable. May also be <code>null</code>
     */
    __findDroppable : function(elem)
    {
      while (elem && elem.nodeType == 1)
      {
        if (elem.getAttribute("qxDroppable") == "on") {
          return elem;
        }

        elem = elem.parentNode;
      }

      return null;
    },


    /**
     * Cleans up a drag&drop session when <code>dragstart</code> was fired before.
     */
    clearSession : function()
    {
      // Deregister from root events
      this.__manager.removeListener(this.__root, "pointermove", this._onPointermove, this);
      this.__manager.removeListener(this.__root, "pointerup", this._onPointerup, this, true);

      this.__manager.removeListener(this.__root, "keydown", this._onKeyDown, this, true);
      this.__manager.removeListener(this.__root, "keyup", this._onKeyUp, this, true);
      this.__manager.removeListener(this.__root, "keypress", this._onKeyPress, this, true);
      this.__manager.removeListener(this.__root, "roll", this._onRoll, this, true);

      // Fire dragend event
      if (this.__dragTarget) {
        this.__fireEvent("dragend", this.__dragTarget, this.__dropTarget, false);
      }

      // Cleanup
      this.__validDrop = false;
      this.__dropTarget = null;
      if (this.__dragTargetWidget) {
        this.__dragTargetWidget.removeState("drag");
        this.__dragTargetWidget = null;
      }

      // Clear init
      this.__dragTarget = null;
      this.__sessionActive = false;
      this.__startConfig = null;
      this.__rebuildStructures();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for long tap which takes care of starting the drag & drop session for
     * touch interactions.
     * @param e {qx.event.type.Tap} The longtap event.
     */
    _onLongtap : function(e) {
      // only for touch
      if (e.getPointerType() != "touch") {
        return;
      }
      // prevent scrolling
      this.__manager.addListener(this.__root, "roll", this._onRoll, this, true);
      this._start(e);
    },


    /**
     * Helper to start the drag & drop session. It is responsible for firing the
     * dragstart event and attaching the key listener.
     * @param e {qx.event.type.Pointer} Either a longtap or pointermove event.
     *
     * @return {Boolean} Returns <code>false</code> if drag session should be
     * canceled.
     */
    _start : function(e) {
      // only for primary pointer and allowed buttons
      var isButtonOk = qx.event.handler.DragDrop.ALLOWED_BUTTONS.indexOf(e.getButton()) !== -1;
      if (!e.isPrimary() || !isButtonOk) {
        return false;
      }

      // start target can be none as the drag & drop handler might
      // be created after the first start event
      var target = this.__startConfig ? this.__startConfig.target : e.getTarget();
      var draggable = this.__findDraggable(target);
      if (draggable) {
        // This is the source target
        this.__dragTarget = draggable;

        var widgetOriginalTarget = qx.ui.core.Widget.getWidgetByElement(this.__startConfig.original);
        while (widgetOriginalTarget && widgetOriginalTarget.isAnonymous()) {
          widgetOriginalTarget = widgetOriginalTarget.getLayoutParent();
        }
        if (widgetOriginalTarget) {
          this.__dragTargetWidget = widgetOriginalTarget;
          widgetOriginalTarget.addState("drag");
        }

        // fire cancelable dragstart
        if (!this.__fireEvent("dragstart", this.__dragTarget, this.__dropTarget, true, e)) {
          return false;
        }

        this.__manager.addListener(this.__root, "keydown", this._onKeyDown, this, true);
        this.__manager.addListener(this.__root, "keyup", this._onKeyUp, this, true);
        this.__manager.addListener(this.__root, "keypress", this._onKeyPress, this, true);
        this.__sessionActive = true;

        return true;
      }
    },


    /**
     * Event handler for the pointerdown event which stores the initial targets and the coordinates.
     * @param e {qx.event.type.Pointer} The pointerdown event.
     */
    _onPointerdown : function(e) {
      if (e.isPrimary()) {
        this.__startConfig = {
          target: e.getTarget(),
          original: e.getOriginalTarget(),
          left : e.getDocumentLeft(),
          top : e.getDocumentTop()
        };

        this.__manager.addListener(this.__root, "pointermove", this._onPointermove, this);
        this.__manager.addListener(this.__root, "pointerup", this._onPointerup, this, true);
      }
    },


    /**
     * Event handler for the pointermove event which starts the drag session and
     * is responsible for firing the drag, dragover and dragleave event.
     * @param e {qx.event.type.Pointer} The pointermove event.
     */
    _onPointermove : function(e) {
      // only allow drag & drop for primary pointer
      if (!e.isPrimary()) {
        return;
      }

      // start the drag session for mouse
      if (!this.__sessionActive && e.getPointerType() == "mouse") {
        var delta = this._getDelta(e);
        // if the mouse moved a bit in any direction
        var distance = qx.event.handler.DragDrop.MIN_DRAG_DISTANCE;
        if (delta && (Math.abs(delta.x) > distance || Math.abs(delta.y) > distance)) {
          if (!this._start(e)) {
            this.clearSession();
            return;
          }
        }
      }

      // check if the session has been activated
      if (!this.__sessionActive) {
        return;
      }

      if (!this.__fireEvent("drag", this.__dragTarget, this.__dropTarget, true, e)) {
        this.clearSession();
      }

      // find current hovered droppable
      var el = e.getTarget();
      var cursor = this.getCursor();
      if (!cursor) {
        cursor = qx.ui.core.DragDropCursor.getInstance();
      }
      var cursorEl = cursor.getContentElement().getDomElement();

      if (el !== cursorEl) {
        var droppable = this.__findDroppable(el);

        // new drop target detected
        if (droppable && droppable != this.__dropTarget) {
          // fire dragleave for previous drop target
          if (this.__dropTarget) {
            this.__fireEvent("dragleave", this.__dropTarget, this.__dragTarget, false, e);
          }

          this.__validDrop = true; // initial value should be true
          this.__dropTarget = droppable;

          this.__validDrop = this.__fireEvent("dragover", droppable, this.__dragTarget, true, e);
        }

        // only previous drop target
        else if (!droppable && this.__dropTarget) {
          this.__fireEvent("dragleave", this.__dropTarget, this.__dragTarget, false, e);
          this.__dropTarget = null;
          this.__validDrop = false;

          qx.event.Timer.once(this.__detectAction, this, 0);
        }
      }

      // Reevaluate current action
      var keys = this.__keys;
      keys.Control = e.isCtrlPressed();
      keys.Shift = e.isShiftPressed();
      keys.Alt = e.isAltPressed();
      this.__detectAction();
    },


    /**
     * Helper function to compute the delta between current cursor position from given event
     * and the stored coordinates at {@link #_onPointerdown}.
     *
     * @param e {qx.event.type.Pointer} The pointer event
     *
     * @return {Map} containing the deltaX as x, and deltaY as y.
     */
    _getDelta : function(e)
    {
      if (!this.__startConfig) {
        return null;
      }

      var deltaX = e.getDocumentLeft() - this.__startConfig.left;
      var deltaY = e.getDocumentTop() - this.__startConfig.top;

      return {
        "x": deltaX,
        "y": deltaY
      };
    },


    /**
     * Handler for the pointerup event which is responsible fore firing the drop event.
     * @param e {qx.event.type.Pointer} The pointerup event
     */
    _onPointerup : function(e) {
      if (!e.isPrimary()) {
        return;
      }

      // Fire drop event in success case
      if (this.__validDrop && this.__validAction) {
        this.__fireEvent("drop", this.__dropTarget, this.__dragTarget, false, e);
      }

      // Stop event
      if (e.getTarget() == this.__dragTarget) {
        e.stopPropagation();
      }

      // Clean up
      this.clearSession();
    },


    /**
     * Roll listener to stop scrolling on touch devices.
     * @param e {qx.event.type.Roll} The roll event.
     */
    _onRoll : function(e) {
      e.stop();
    },


    /**
     * Event listener for window's <code>blur</code> event
     *
     * @param e {qx.event.type.Event} Event object
     */
    _onWindowBlur : function(e) {
      this.clearSession();
    },


    /**
     * Event listener for root's <code>keydown</code> event
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onKeyDown : function(e) {
      var iden = e.getKeyIdentifier();
      switch(iden)
      {
        case "Alt":
        case "Control":
        case "Shift":
          if (!this.__keys[iden])
          {
            this.__keys[iden] = true;
            this.__detectAction();
          }
      }
    },


    /**
     * Event listener for root's <code>keyup</code> event
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onKeyUp : function(e) {
      var iden = e.getKeyIdentifier();
      switch(iden)
      {
        case "Alt":
        case "Control":
        case "Shift":
          if (this.__keys[iden])
          {
            this.__keys[iden] = false;
            this.__detectAction();
          }
      }
    },


    /**
     * Event listener for root's <code>keypress</code> event
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onKeyPress : function(e) {
      var iden = e.getKeyIdentifier();
      switch(iden)
      {
        case "Escape":
          this.clearSession();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    qx.event.Registration.removeListener(window, "blur", this._onWindowBlur, this);

    // Clear fields
    this.__dragTarget = this.__dropTarget = this.__manager = this.__root =
      this.__types = this.__actions = this.__keys = this.__cache = null;
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
