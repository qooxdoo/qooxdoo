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
    this._manager = manager;
    this._window = manager.getWindow();
    this._root = this._window.document.documentElement;

    // Initialize
    this._initObserver();
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
      dragdrop : 1
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
      CUSTOM FEATURES
    ---------------------------------------------------------------------------
    */

    addType : function(type)
    {
      this.debug("Support type: " + type);
      this.__types[type] = true;
    },

    addAction : function(action)
    {
      this.debug("Support action: " + action);
      this.__actions[action] = true;
    },

    supportsType : function(type) {
      return !!this.__types[type];
    },

    supportsAction : function(type) {
      return !!this.__actions[type];
    },






    /*
    ---------------------------------------------------------------------------
      CUSTOM FEATURES
    ---------------------------------------------------------------------------
    */

    __fireEvent : function(original, target, type)
    {
      var Registration = qx.event.Registration;

      var evt = Registration.createEvent(type, qx.event.type.Drag, [original, target]);
      return Registration.dispatchEvent(target, evt);
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


    /**
     * Initializes event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _initObserver : function()
    {
      var mgr = this._manager;

      mgr.addListener(this._root, "mousedown", this._onMouseDown, this, true);
      mgr.addListener(this._root, "mouseup", this._onMouseUp, this, true);
      mgr.addListener(this._root, "losecapture", this._onLoseCapture, this, true);
    },


    _onMouseDown : function(e)
    {
      var dragable = this.__findDragable(e.getTarget());
      if (dragable)
      {
        this._manager.addListener(this._root, "mousemove", this._onMouseMove, this, true);

        this._startLeft = e.getDocumentLeft();
        this._startTop = e.getDocumentTop();
        this.__startTarget = dragable;

        this.__types = {};
        this.__actions = {};
      }
    },


    _onMouseUp : function(e)
    {
      if (this.__dropOk)
      {
        this.__fireEvent(e, this.__lastOver, "dragdrop");
      }

      this._clearSession(e);
    },


    _onLoseCapture : function(e)
    {
      this._clearSession(e);
    },


    _clearSession : function(e)
    {
      var mgr = this._manager;

      mgr.removeListener(this._root, "mousemove", this._onMouseMove, this, true);

      if (this.__sessionActive)
      {
        mgr.removeListener(this._root, "mouseover", this._onMouseOver, this, true);

        this.__fireEvent(e, this.__startTarget, "dragend");
      }

      this.__sessionActive = false;
      this.__startTarget = null;
      this.__lastOver = null;
    },


    _onMouseMove : function(e)
    {
      var left = e.getDocumentLeft();
      var top = e.getDocumentTop();

      if (this.__sessionActive)
      {
        // TODO
      }
      else
      {
        if (Math.abs(left-this._startLeft) > 3 || Math.abs(top-this._startTop) > 3)
        {
          this.__sessionActive = true;

          this._manager.addListener(this._root, "mouseover", this._onMouseOver, this, true);

          this.__fireEvent(e, this.__startTarget, "dragstart");
        }
      }
    },

    __dropOk : false,

    _onMouseOver : function(e)
    {
      var target = e.getTarget();
      var dropable = this.__findDropable(target);

      if (dropable)
      {
        if (dropable != this.__lastOver)
        {
          this.__dropOk = this.__fireEvent(e, dropable, "dragover");
          this.__lastOver = dropable;
        }
      }
      else if (this.__lastOver)
      {
        this.__fireEvent(e, this.__lastOver, "dragout");
        this.__lastOver = null;
        this.__dropOk = false;
      }
    }
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