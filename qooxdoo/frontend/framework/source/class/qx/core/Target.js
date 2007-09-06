/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.event.handler.ObjectEventHandler)

************************************************************************ */

/**
 * This is the main constructor for all objects that need to be connected to qx.legacy.event.type.Event objects.
 *
 * In objects created with this constructor, you find functions to addEventListener or
 * removeEventListener to or from the created object. Each event to connect to has a type in
 * form of an identification string. This type could be the name of a regular dom event like "click" or
 * something self-defined like "ready".
 */
qx.Class.define("qx.core.Target",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Add event listener to an object.
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     */
    addEventListener : function(type, func, obj)
    {
      if (this.getDisposed()) {
        return;
      }

      qx.event.Manager.getManager(this).addListener(this, type, func, obj, false);
    },


    /**
     * Remove event listener from object
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     * @return {void}
     */
    removeEventListener : function(type, func, obj)
    {
      if (this.getDisposed()) {
        return;
      }

      qx.event.Manager.getManager(this).removeListener(this, type, func, obj, false);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT CONNECTION UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Check if there are one or more listeners for an event type.
     *
     * @type member
     * @param type {String} name of the event type
     * @return {var} TODOC
     */
    hasEventListeners : function(type) {
      return qx.event.Manager.getManager(this).hasListeners(this, type);
    },


    /**
     * Checks if the event is registered. If so it creates an event object and dispatches it.
     *
     * @type member
     * @param type {String} name of the event type
     * @return {void}
     */
    createDispatchEvent : function(type) {
      this.dispatchEvent(new qx.legacy.event.type.Event(type), true);
    },


    /**
     * Checks if the event is registered. If so it creates an event object and dispatches it.
     *
     * @type member
     * @param type {String} name of the event type
     * @param data {Object} user defined data attached to the event object
     * @return {void}
     */
    createDispatchDataEvent : function(type, data) {
      this.dispatchEvent(new qx.legacy.event.type.DataEvent(type, data), true);
    },


    /**
     * Checks if the event is registered. If so it creates an event object and dispatches it.
     *
     * @type member
     * @param type {String} name of the event type
     * @param value {Object} property value attached to the event object
     * @param old {Object} old property value attached to the event object
     * @return {void}
     */
    createDispatchChangeEvent : function(type, value, old) {
      this.dispatchEvent(new qx.event.type.ChangeEvent(type, value, old), true);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatch an event
     *
     * @type member
     * @param evt {qx.legacy.event.type.Event} event to dispatch
     * @return {Boolean} whether the event default was prevented or not. Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt)
    {
      // Ignore event if eventTarget is disposed
      if (this.getDisposed()) {
        return;
      }

      qx.event.Manager.getManager(this).dispatchEvent(this, evt);
    }
  }
});
