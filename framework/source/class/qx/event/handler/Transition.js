/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

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
 * This class provides support for HTML5 transition and animation events.
 * Currently only WebKit and Firefox are supported.
 */
qx.Class.define("qx.event.handler.Transition",
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

    this.__registeredEvents = {};
    this.__onEventWrapper = qx.lang.Function.listener(this._onNative, this);
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
      transitionEnd : 1,
      animationEnd : 1,
      animationStart : 1,
      animationIteration : 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,

    /** Mapping of supported event types to native event types */
    TYPE_TO_NATIVE : qx.core.Environment.select("engine.name",
    {
      "webkit" :
      {
        transitionEnd : "webkitTransitionEnd",
        animationEnd : "webkitAnimationEnd",
        animationStart : "webkitAnimationStart",
        animationIteration : "webkitAnimationIteration"
      },

      "gecko" :
      {
        transitionEnd : "transitionend",
        animationEnd : "animationend",
        animationStart : "animationstart",
        animationIteration : "animationiteration"
      },

      "default" : null
    }),

    /** Mapping of native event types to supported event types */
    NATIVE_TO_TYPE : qx.core.Environment.select("engine.name",
    {
      "webkit" :
      {
        webkitTransitionEnd : "transitionEnd",
        webkitAnimationEnd : "animationEnd",
        webkitAnimationStart : "animationStart",
        webkitAnimationIteration : "animationIteration"
      },

      "gecko" :
      {
        transitionend : "transitionEnd",
        animationend : "animationEnd",
        animationstart : "animationStart",
        animationiteration : "animationIteration"
      },

      "default" : null
    })
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members:
  {
    __onEventWrapper : null,
    __registeredEvents : null,


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent: function(target, type) {
      // Nothing needs to be done here
    },


    // interface implementation
    /**
     * @signature function(target, type, capture)
     */
    registerEvent: qx.core.Environment.select("engine.name",
    {
      "webkit|gecko" : function(target, type, capture)
      {
        var hash = qx.core.ObjectRegistry.toHashCode(target) + type;

        var nativeType = qx.event.handler.Transition.TYPE_TO_NATIVE[type];

        this.__registeredEvents[hash] =
        {
          target:target,
          type : nativeType
        };

        qx.bom.Event.addNativeListener(target, nativeType, this.__onEventWrapper);
      },

      "default" : function() {}
    }),


    // interface implementation
    /**
     * @signature function(target, type, capture)
     */
    unregisterEvent: qx.core.Environment.select("engine.name",
    {
      "webkit|gecko" : function(target, type, capture)
      {
        var events = this.__registeredEvents;

        if (!events) {
          return;
        }

        var hash = qx.core.ObjectRegistry.toHashCode(target) + type;

        if (events[hash]) {
          delete events[hash];
        }

        qx.bom.Event.removeNativeListener(target, qx.event.handler.Transition.TYPE_TO_NATIVE[type], this.__onEventWrapper);
      },

      "default" : function() {}
    }),



    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Global handler for the transition event.
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event
     */
    _onNative : qx.event.GlobalError.observeMethod(function(nativeEvent) {
      qx.event.Registration.fireEvent(nativeEvent.target, qx.event.handler.Transition.NATIVE_TO_TYPE[nativeEvent.type], qx.event.type.Event);
    })
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var event;
    var events = this.__registeredEvents;

    for (var id in events)
    {
      event = events[id];
      if (event.target) {
        qx.bom.Event.removeNativeListener(event.target, event.type, this.__onEventWrapper);
      }
    }

    this.__registeredEvents = this.__onEventWrapper = null;
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