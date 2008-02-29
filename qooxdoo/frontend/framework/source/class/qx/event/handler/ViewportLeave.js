/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event handler, which tries to detect, whether the mouse cursor enters or
 * leaves the document viewport.
 *
 * It supports the events <code>viewportenter</code> and <code>viewportleave</code>.
 */
qx.Class.define("qx.event.handler.ViewportLeave",
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
    this._document = this._window.document;
    this._body = this._document.body;

    this._initMouseObserver();
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
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return this._eventTypes[type];
    },

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
      HELPER
    ---------------------------------------------------------------------------
    */

    /** {Map} Internal data structure with all supported events */
    _eventTypes :
    {
      viewportleave : true,
      viewportenter : true
    },


    /**
     * Fire a mouse event with the given parameters
     *
     * @type member
     * @param domEvent {Event} DOM event
     * @param type {String} type og the event
     * @return {void}
     */
    _fireEvent : function(domEvent, type)
    {
      var event = qx.event.Registration.createEvent(qx.event.type.Mouse, [ domEvent, type ]);
      event.setBubbles(false);
      this._manager.dispatchEvent(this._window, event);
    },




    /*
    ---------------------------------------------------------------------------
      NATIVE MOUSE EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for native mouse out event
     *
     * @signature function(domEvent)
     * @type member
     * @param domEvent {Event} Native event object
     * @return {void}
     */
    _onNativeMouseOut : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(domEvent)
      {
        var target = domEvent.srcElement;
        var relatedTarget = domEvent.fromElement;

        if (domEvent.clientX === -1 && domEvent.clientY === -1) {
          this._fireEvent(domEvent, "viewportleave");
        }
      },

      "gecko|webkit" : function(domEvent)
      {
        var relatedTarget = domEvent.relatedTarget;

        if (relatedTarget === null) {
          this._fireEvent(domEvent, "viewportleave");
        }
      },

      "opera" : function(domEvent)
      {
        var target = domEvent.target;

        if (target === this._body) {
          this._fireEvent(domEvent, "viewportenter");
        }
      }
    }),


    /**
     * Event listener for native mouse over event
     *
     * @signature function(domEvent)
     * @type member
     * @param domEvent {Event} Native event object
     * @return {void}
     */
    _onNativeMouseOver : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(domEvent)
      {
        var relatedTarget = domEvent.fromElement;

        if (relatedTarget === null) {
          this._fireEvent(domEvent, "viewportenter");
        }
      },

      "gecko|webkit" : function(domEvent)
      {
        var relatedTarget = domEvent.relatedTarget;

        if (relatedTarget === null) {
          this._fireEvent(domEvent, "viewportenter");
        }
      },

      "opera" : function(domEvent)
      {
        var target = domEvent.target;

        if (target === this._body) {
          this._fireEvent(domEvent, "viewportleave");
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _initMouseObserver : function()
    {
      this._onNativeMouseOutWrapper = qx.lang.Function.listener(this._onNativeMouseOut, this);
      qx.bom.Event.addNativeListener(this._document.documentElement, "mouseout", this._onNativeMouseOutWrapper);

      this._onNativeMouseOverWrapper = qx.lang.Function.listener(this._onNativeMouseOver, this);
      qx.bom.Event.addNativeListener(this._document.documentElement, "mouseover", this._onNativeMouseOverWrapper);
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _stopMouseObserver : function()
    {
      qx.bom.Event.removeNativeListener(this._document.documentElement, "mouseout", this._onNativeMouseOutWrapper);
      qx.bom.Event.removeNativeListener(this._document.documentElement, "mouseover", this._onNativeMouseOverWrapper);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopMouseObserver();
    this._disposeFields("_manager", "_window", "_document", "_body");
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
