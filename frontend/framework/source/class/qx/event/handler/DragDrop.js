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
   * @type constructor
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

    // Build data structures
    this.__types = {};
    this.__actions = {};
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
      dragout : 1,
      dragdrop : 1,
      dragmove : 1
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

    addData : function(type, data) {
      this.__types[type] = data;
    },

    addAction : function(action) {
      this.__actions[action] = true;
    },

    supportsType : function(type) {
      return !!this.__types[type];
    },

    supportsAction : function(type) {
      return !!this.__actions[type];
    },

    getData : function(type) {
      return this.__types[type];
    },

    getAction : function() {
      return "copy";
    },






    /*
    ---------------------------------------------------------------------------
      INTERNAL UTILS
    ---------------------------------------------------------------------------
    */

    __detectEventAction : function(e)
    {
      var shiftPressed = e.isShiftPressed();
      var ctrlPressed = e.isCtrlPressed();
      var altPressed = e.isAltPressed();

      var actions = this.__actions;

      if (shiftPressed && ctrlPressed && actions.alias) {
        return "alias";
      } else if (shiftPressed && altPressed && actions.copy) {
        return "copy";
      } else if (shiftPressed && actions.move) {
        return "move";
      } else if (altPressed && actions.alias) {
        return "alias";
      } else if (ctrlPressed && actions.copy) {
        return "copy";
      }
      else
      {
        // Configurable default action?
        return "move";
      }

      return null;
    },

    __fireEvent : function(type, target, cancelable, original)
    {
      var Registration = qx.event.Registration;
      var dragEvent = Registration.createEvent(type, qx.event.type.Drag, [ cancelable, original ]);

      return Registration.dispatchEvent(target, dragEvent);
    },

    __findDragable : function(elem)
    {
      while (elem && elem.nodeType == 1)
      {
        if (elem.getAttribute("qxDragable") == "on") {
          return elem;
        }

        elem = elem.parentNode;
      }

      return null;
    },

    __findDropable : function(elem)
    {
      while (elem && elem.nodeType == 1)
      {
        if (elem.getAttribute("qxDropable") == "on") {
          return elem;
        }

        elem = elem.parentNode;
      }

      return null;
    },

    __clearInit : function()
    {
      // Clear drag target
      this.__dragTarget = null;

      // Deregister from root events
      this.__manager.removeListener(this.__root, "mousemove", this._onMouseMove, this, true);
      this.__manager.removeListener(this.__root, "mouseup", this._onMouseUp, this, true);

      // Deregister from window's blur
      qx.event.Registration.removeListener(window, "blur", this._onWindowBlur, this);
    },

    __clearSession : function()
    {
      if (this.__sessionActive)
      {
        // Deregister from root events
        this.__manager.removeListener(this.__root, "mouseover", this._onMouseOver, this, true);

        // Fire dragend event
        this.__fireEvent("dragend", this.__dragTarget, false);

        // Clear flag
        this.__sessionActive = false;
      }

      // Cleanup
      this.__dropOk = false;
      this.__dropTarget = null;

      // Clear init
      this.__clearInit();
    },

    __dropOk : false,







    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


    _onWindowBlur : function(e)
    {
      this.debug("Window blur");
      this.__clearSession();
    },


    _onMouseDown : function(e)
    {
      if (this.__sessionActive) {
        return;
      }

      var dragable = this.__findDragable(e.getTarget());
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


    _onMouseUp : function(e)
    {
      // Fire dragdrop event in success case
      if (this.__dropOk) {
        this.__fireEvent("dragdrop", this.__dropTarget, false, e.getNativeEvent());
      }

      // Stop event
      if (this.__sessionActive) {
        e.stopPropagation();
      }

      // Clean up
      this.__clearSession();
    },


    _onMouseMove : function(e)
    {
      // Whether the session is already active
      if (this.__sessionActive)
      {
        // Fire specialized move event
        this.__fireEvent("dragmove", this.__dragTarget, false, e.getNativeEvent());
      }
      else
      {
        if (Math.abs(e.getDocumentLeft()-this.__startLeft) > 3 || Math.abs(e.getDocumentTop()-this.__startTop) > 3)
        {
          if (this.__fireEvent("dragstart", this.__dragTarget, true, e.getNativeEvent()))
          {
            // Flag session as active
            this.__sessionActive = true;

            // Register to root events
            this.__manager.addListener(this.__root, "mouseover", this._onMouseOver, this, true);
          }
          else
          {
            this.__clearInit();
          }
        }
      }
    },


    _onMouseOver : function(e)
    {
      var target = e.getTarget();
      var dropable = this.__findDropable(target);

      if (dropable)
      {
        if (dropable != this.__dropTarget)
        {
          this.__dropOk = this.__fireEvent("dragover", dropable, true, e.getNativeEvent());
          this.__dropTarget = dropable;
        }
      }
      else if (this.__dropTarget)
      {
        this.__fireEvent("dragout", this.__dropTarget, false, e.getNativeEvent());
        this.__dropTarget = null;
        this.__dropOk = false;
      }
    }
  },



  destruct : function()
  {
    // Clear a running session
    this.__clearSession();

    // Stop mousedown
    this.__manager.removeListener(this.__root, "mousedown", this._onMouseDown, this);

    // Clear fields
    this._disposeFields("__dragTarget", "__dropTarget",
      "__manager", "__root");
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