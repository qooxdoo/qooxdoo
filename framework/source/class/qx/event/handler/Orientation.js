/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

   ======================================================================

   This class contains code based on the following work:

   * Unify Project

     Homepage:
       http://unify-project.org

     Copyright:
       2009-2010 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This class provides a handler for the orientation event.
 */
qx.Class.define("qx.event.handler.Orientation",
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
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this.__manager = manager;
    this.__window = manager.getWindow();
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
      orientationchange : 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_WINDOW,

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
    __manager : null,
    __window : null,
    __nativeEventType : null,
    _currentOrientation : null,
    __onNativeWrapper : null,


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      // Nothing needs to be done here
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
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native orientation change event listeners.
     */
    _initObserver : function()
    {
      this.__onNativeWrapper = qx.lang.Function.listener(this._onNative, this);

      // Handle orientation change event for Android devices by the resize event.
      // See http://stackoverflow.com/questions/1649086/detect-rotation-of-android-phone-in-the-browser-with-javascript
      // for more information.
      this.__nativeEventType = qx.bom.Event.supportsEvent(this.__window, "orientationchange") ?
            "orientationchange" : "resize";

      var Event = qx.bom.Event;
      Event.addNativeListener(this.__window, this.__nativeEventType, this.__onNativeWrapper);
    },


    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native orientation change event listeners.
     */
    _stopObserver : function()
    {
      var Event = qx.bom.Event;
      Event.removeNativeListener(this.__window, this.__nativeEventType, this.__onNativeWrapper);
    },


    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for the native orientation change event.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} The touch event from the browser.
     */
    _onNative : qx.event.GlobalError.observeMethod(function(domEvent)
    {
      var Viewport = qx.bom.Viewport;
      var orientation = Viewport.getOrientation(domEvent.target);

      if (this._currentOrientation != orientation)
      {
        this._currentOrientation = orientation;
        var mode = Viewport.isLandscape(domEvent.target) ? "landscape" : "portrait";
        qx.event.Registration.fireEvent(
            this.__window,
            "orientationchange",
            qx.event.type.Orientation,
            [orientation, mode]
        );
      }
    })
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopObserver();
    this.__manager = this.__window = null;
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