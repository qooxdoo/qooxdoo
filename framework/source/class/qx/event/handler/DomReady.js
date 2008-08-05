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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://www.jquery.com
     Version 1.2

     Copyright:
       (c) 2006-2007, John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * John Resig

   ======================================================================

   This class contains code based on the following work:

   * IEContentLoaded
       http://javascript.nwbox.com/IEContentLoaded/

     Copyright:
       (c) 2007, Diego Perini

     Authors:
       * Diego Perini

************************************************************************ */

/**
 * This handler provides a cross-browser "domready" event which fires when
 * the DOM is completely loaded, but the content e.g. images are still
 * missing.
 */
qx.Class.define("qx.event.handler.DomReady",
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
    this._window = manager.getWindow();

    // Initialize observers
    this._initWindowObserver();
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
    SUPPORTED_TYPES : {
      domready : true
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
      OBSERVER INIT/STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse event listeners.
     *
     * @return {void}
     */
    _initWindowObserver : function()
    {
      var win = this._window;
      var nativeWrapper = this._onNativeWrapper = qx.lang.Function.listener(this._onNative, this);

      // Using most native method supported by Mozilla and Opera >= 9.0
      if (qx.core.Variant.isSet("qx.client", "gecko|opera")) {
        qx.bom.Event.addNativeListener(win, "DOMContentLoaded", nativeWrapper);
      }

      // Native implementation for webkit still missing by webkit. See also:
      // http://bugs.webkit.org/show_bug.cgi?id=5122
      else if (qx.core.Variant.isSet("qx.client", "webkit|mshtml"))
      {
        // Continually check to see if the document is ready
        var timer = function()
        {
          try
          {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            if (qx.bom.client.Engine.MSHTML || document.readyState != "loaded" && document.readyState != "complete") {
              document.documentElement.doScroll("left");
            }

            nativeWrapper();
          }
          catch(error) {
            setTimeout(timer, 100);
          }
        };

        timer();
      }

      // Additional load listener as fallback
      qx.bom.Event.addNativeListener(this._window, "load", nativeWrapper);
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @return {void}
     */
    _stopWindowObserver : function()
    {
      var win = this._window;

      if (qx.core.Variant.isSet("qx.client", "gecko|opera")) {
        qx.bom.Event.removeNativeListener(win, "DOMContentLoaded", this._onNativeWrapper);
      }

      qx.bom.Event.removeNativeListener(this._window, "load", this._onNativeWrapper);
    },




    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Native listener for browser implementations.
     *
     * @return {void}
     */
    _onNative : function()
    {
      if (!this._fired)
      {
        qx.event.Registration.fireEvent(this._window, "domready");
        this._fired = true;
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
    this._stopWindowObserver();
    this._disposeFields("_window");
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
