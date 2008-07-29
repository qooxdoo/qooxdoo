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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    addData : function(type, data)
    {
      this.debug("Add data: " + type + ": " + data);
      this.__types[type] = data;
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

    getData : function(type) {
      return this.__types[type];
    },

    getAction : function() {
      this.__currentAction = "TODO";
    },






    /*
    ---------------------------------------------------------------------------
      INTERNAL UTILS
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

    __clearSession : function(e)
    {
      var mgr = this._manager;

      mgr.removeListener(this._root, "mousemove", this._onMouseMove, this, true);

      if (this.__sessionActive)
      {
        mgr.removeListener(this._root, "mouseover", this._onMouseOver, this, true);

        this.__fireEvent(e, this.__startTarget, "dragend");
      }

      this.__dropOk = false;
      this.__sessionActive = false;
      this.__startTarget = null;
      this.__lastTarget = null;
    },

    __dropOk : false,





    /*
    ---------------------------------------------------------------------------
      NATIVE OBSERVER
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes event listeners.
     */
    _initObserver : function()
    {
      qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this);

      var mgr = this._manager;
      mgr.addListener(this._root, "mousedown", this._onMouseDown, this, true);
      mgr.addListener(this._root, "mouseup", this._onMouseUp, this, true);
      mgr.addListener(this._root, "losecapture", this._onLoseCapture, this, true);
    },


    /**
     * Stops event listeners.
     */
    _stopObserver : function()
    {
      qx.event.Registration.removeListener(window, "blur", this._onWindowBlur, this);

      var mgr = this._manager;
      mgr.removeListener(this._root, "mousedown", this._onMouseDown, this, true);
      mgr.removeListener(this._root, "mouseup", this._onMouseUp, this, true);
      mgr.removeListener(this._root, "losecapture", this._onLoseCapture, this, true);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


    _onLoseCapture : function(e) {
      this.__clearSession(e);
    },


    _onWindowBlur : function(e) {
      this.__clearSession(e);
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
        this.__fireEvent(e, this.__lastTarget, "dragdrop");
      }

      this.__clearSession(e);
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


    _onMouseOver : function(e)
    {
      var target = e.getTarget();
      var dropable = this.__findDropable(target);

      if (dropable)
      {
        if (dropable != this.__lastTarget)
        {
          this.__dropOk = this.__fireEvent(e, dropable, "dragover");
          this.__lastTarget = dropable;
        }
      }
      else if (this.__lastTarget)
      {
        this.__fireEvent(e, this.__lastTarget, "dragout");
        this.__lastTarget = null;
        this.__dropOk = false;
      }
    }
  },



  destruct : function()
  {
    this._stopObserver();
    this._disposeFields("__dropOk", "__lastTarget", "__startTarget", "__lastTarget");
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