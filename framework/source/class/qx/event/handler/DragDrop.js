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

/* ************************************************************************

#require(qx.event.handler.Mouse)
#require(qx.event.handler.Keyboard)
#require(qx.event.handler.Capture)

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
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this.__manager = manager;
    this.__root = manager.getWindow().document.documentElement;

    // Initialize mousedown listener
    this.__manager.addListener(this.__root, "mousedown", this._onMouseDown, this);

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
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** {Map} Supported event types */
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
        this.__fireEvent("droprequest", this.__dragTarget, false);
      }

      if (!this.__cache[type]) {
        throw new Error("Please use a dragrequest listener to the drag target to fill the manager with data!");
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
      return this.__currentAction;
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
      var actions = this.__actions;
      var keys = this.__keys;
      var current = null;

      if (this.__validDrop)
      {
        if (keys.Shift && keys.Ctrl && actions.alias) {
          current = "alias";
        } else if (keys.Shift && keys.Alt && actions.copy) {
          current = "copy";
        } else if (keys.Shift && actions.move) {
          current = "move";
        } else if (keys.Alt && actions.alias) {
          current = "alias";
        } else if (keys.Ctrl && actions.copy) {
          current = "copy";
        } else if (actions.move) {
          current = "move";
        } else if (actions.copy) {
          current = "copy";
        } else if (actions.alias) {
          current = "alias";
        }
      }

      if (current != this.__currentAction)
      {
        this.__currentAction = current;
        this.__fireEvent("dragchange", this.__dragTarget, false);
      }
    },


    /**
     * Wrapper for {@link qx.event.Registration#fireEvent} for drag&drop events
     * needed in this class.
     *
     * @param type {String} Event type
     * @param target {Object} Target to fire on
     * @param cancelable {Boolean} Whether the event is cancelable
     * @param original {qx.event.type.Mouse} Original mouse event
     */
    __fireEvent : function(type, target, cancelable, original)
    {
      var Registration = qx.event.Registration;
      var dragEvent = Registration.createEvent(type, qx.event.type.Drag, [ cancelable, original ]);

      if (this.__dragTarget !== this.__dropTarget)
      {
        if (target == this.__dragTarget) {
          dragEvent.setRelatedTarget(this.__dropTarget);
        } else {
          dragEvent.setRelatedTarget(this.__dragTarget);
        }
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
     * Clean up event listener and structures when a drag was ended without ever starting into session mode
     * (e.g. not reaching the required offset before)
     */
    __clearInit : function()
    {
      // Clear drag target
      this.__dragTarget = null;

      // Deregister from root events
      this.__manager.removeListener(this.__root, "mousemove", this._onMouseMove, this, true);
      this.__manager.removeListener(this.__root, "mouseup", this._onMouseUp, this, true);

      // Deregister from window's blur
      qx.event.Registration.removeListener(window, "blur", this._onWindowBlur, this);

      // Clear structures
      this.__rebuildStructures();
    },


    /**
     * Cleans up a drag&drop session when <code>dragstart</code> was fired before.
     */
    __clearSession : function()
    {
      if (this.__sessionActive)
      {
        // Deregister from root events
        this.__manager.removeListener(this.__root, "mouseover", this._onMouseOver, this, true);
        this.__manager.removeListener(this.__root, "mouseout", this._onMouseOut, this, true);
        this.__manager.removeListener(this.__root, "keydown", this._onKeyDown, this, true);
        this.__manager.removeListener(this.__root, "keyup", this._onKeyUp, this, true);

        // Fire dragend event
        this.__fireEvent("dragend", this.__dragTarget, false);

        // Clear flag
        this.__sessionActive = false;
      }

      // Cleanup
      this.__validDrop = false;
      this.__dropTarget = null;

      // Clear init
      this.__clearInit();
    },


    /** {Boolean} Whether a valid drop object exists */
    __validDrop : false,







    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for window's <code>blur</code> event
     *
     * @param e {qx.event.type.Event} Event object
     */
    _onWindowBlur : function(e) {
      this.__clearSession();
    },


    /**
     * Event listener for root's <code>keydown</code> event
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onKeyDown : function(e)
    {
      var iden = e.getKeyIdentifier();
      switch(iden)
      {
        case "Alt":
        case "Ctrl":
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
    _onKeyUp : function(e)
    {
      var iden = e.getKeyIdentifier();
      switch(iden)
      {
        case "Alt":
        case "Ctrl":
        case "Shift":
          if (this.__keys[iden])
          {
            this.__keys[iden] = false;
            this.__detectAction();
          }
      }
    },


    /**
     * Event listener for root's <code>mousedown</code> event
     *
     * @param e {qx.event.type.Mouse} Event object
     */
    _onMouseDown : function(e)
    {
      if (this.__sessionActive) {
        return;
      }

      var dragable = this.__findDraggable(e.getTarget());
      if (dragable)
      {
        // Cache coordinates for offset calculation
        this.__startLeft = e.getDocumentLeft();
        this.__startTop = e.getDocumentTop();

        // This is the source target
        this.__dragTarget = dragable;

        // Register move event to manager
        this.__manager.addListener(this.__root, "mousemove", this._onMouseMove, this, true);
        this.__manager.addListener(this.__root, "mouseup", this._onMouseUp, this, true);

        // Register window blur listener
        qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this);
      }
    },


    /**
     * Event listener for root's <code>mouseup</code> event
     *
     * @param e {qx.event.type.Mouse} Event object
     */
    _onMouseUp : function(e)
    {
      // Fire drop event in success case
      if (this.__validDrop) {
        this.__fireEvent("drop", this.__dropTarget, false, e);
      }

      // Stop event
      if (this.__sessionActive) {
        e.stopPropagation();
      }

      // Clean up
      this.__clearSession();
    },


    /**
     * Event listener for root's <code>mousemove</code> event
     *
     * @param e {qx.event.type.Mouse} Event object
     */
    _onMouseMove : function(e)
    {
      // Whether the session is already active
      if (this.__sessionActive)
      {
        // Fire specialized move event
        if (!this.__fireEvent("drag", this.__dragTarget, true, e)) {
          this.__clearSession();
        }
      }
      else
      {
        if (Math.abs(e.getDocumentLeft()-this.__startLeft) > 3 || Math.abs(e.getDocumentTop()-this.__startTop) > 3)
        {
          if (this.__fireEvent("dragstart", this.__dragTarget, true, e))
          {
            // Flag session as active
            this.__sessionActive = true;

            // Register to root events
            this.__manager.addListener(this.__root, "mouseover", this._onMouseOver, this, true);
            this.__manager.addListener(this.__root, "mouseout", this._onMouseOut, this, true);
            this.__manager.addListener(this.__root, "keydown", this._onKeyDown, this, true);
            this.__manager.addListener(this.__root, "keyup", this._onKeyUp, this, true);

            // Reevaluate current action
            var keys = this.__keys;
            keys.Ctrl = e.isCtrlPressed();
            keys.Shift = e.isShiftPressed();
            keys.Alt = e.isAltPressed();
            this.__detectAction();
          }
          else
          {
            // Fire dragend event
            this.__fireEvent("dragend", this.__dragTarget, false);

            // Clean up
            this.__clearInit();
          }
        }
      }
    },


    /**
     * Event listener for root's <code>mouseover</code> event
     *
     * @param e {qx.event.type.Mouse} Event object
     */
    _onMouseOver : function(e)
    {
      var target = e.getTarget();
      var dropable = this.__findDroppable(target);

      if (dropable && dropable != this.__dropTarget)
      {
        this.__validDrop = this.__fireEvent("dragover", dropable, true, e);
        this.__dropTarget = dropable;

        this.__detectAction();
      }
    },


    /**
     * Event listener for root's <code>mouseout</code> event
     *
     * @param e {qx.event.type.Mouse} Event object
     */
    _onMouseOut : function(e)
    {
      var target = e.getTarget();
      var dropable = this.__findDroppable(target);

      if (dropable && dropable == this.__dropTarget)
      {
        this.__fireEvent("dragleave", this.__dropTarget, false, e);
        this.__dropTarget = null;
        this.__validDrop = false;

        this.__detectAction();
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
    // Clear a running session
    this.__clearSession();

    // Stop mousedown
    this.__manager.removeListener(this.__root, "mousedown", this._onMouseDown, this);

    // Clear fields
    this._disposeFields("__dragTarget", "__dropTarget",
      "__manager", "__root",
      "__types", "__actions", "__keys", "__cache");
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