/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin offers basic event handling capabilities. It includes the
 * commonly known methods for managing event listeners and firing events.
 *
 * @use(qx.event.dispatch.Direct)
 * @use(qx.event.handler.Object)
 */
qx.Mixin.define("qx.core.MEvent",
{
  members :
  {
    /** @type {Class} Pointer to the regular event registration class */
    __Registration : qx.event.Registration,


    /**
     * Add event listener to this object.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(type, listener, self, capture)
    {
      if (!this.$$disposed) {
        return this.__Registration.addListener(this, type, listener, self, capture);
      }

      return null;
    },


    /**
     * Add event listener to this object, which is only called once. After the
     * listener is called the event listener gets removed.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param context {Object ? window} reference to the 'this' variable inside the callback
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListenerOnce : function(type, listener, context, capture)
    {
      // id of listener added with callback
      var id;
      var callback = function(e)
      {
        this.__removeOnceListenerOnceById(type, id, listener);
        listener.call(self||this, e);
      };
      // to get actual id
      callback = callback.bind(this);

      // check for wrapped callbacks storage
      if (!listener.$$wrapped_callbacks_ids) {
        listener.$$wrapped_callbacks_ids = {};
        // store the call for each type in case the listener is
        // used for more than one type [BUG #8038]
        listener.$$wrapped_callbacks_ids[type + this.$$hash] = [];

      } else if (listener.$$wrapped_callbacks_ids.hasOwnProperty(type + this.$$hash)) {
        if (qx.core.Environment.get("qx.debug") && listener.$$wrapped_callbacks_ids[type + this.$$hash].length)
        {
          qx.log.Logger.warn("This listener '" + listener.name + "' of current object '" + this.$$hash +
            (this.name ? " (" + this.name + ")" : "") + "' on event with '" +
            type + "'' type already added. Please don't do this duplication."
          );
        }
      } else {
        listener.$$wrapped_callbacks_ids[type + this.$$hash] = [];
      }
      id = this.addListener(type, callback, this, capture);
      listener.$$wrapped_callbacks_ids[type + this.$$hash].push(id);
      return id;
    },


    /**
     * Remove event listener from this object that added in addListenerOnce only
     * to avoid loosing of duplicated listeners added for same type & for same obj [BUG #9627]
     *
     * @param type {String} name of the event type
     * @param id {String} id of added listener to remove
     * @param listener {Function} event callback function
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    __removeOnceListenerOnceById : function(type, id, listener)
    {
      if (!this.$$disposed) {
        // special handling for wrapped once listener
        if (listener.$$wrapped_callbacks_ids && listener.$$wrapped_callbacks_ids.hasOwnProperty(type + this.$$hash) &&
          listener.$$wrapped_callbacks_ids[type + this.$$hash].length) {

          var i = listener.$$wrapped_callbacks_ids[type + this.$$hash].indexOf(id);
          if (i < 0) {
            return false;
          }
          qx.lang.Array.removeAt(listener.$$wrapped_callbacks_ids[type + this.$$hash], i);
          if (listener.$$wrapped_callbacks_ids[type + this.$$hash].length === 0) {
            delete listener.$$wrapped_callbacks_ids[type + this.$$hash];
            if (Object.keys(listener.$$wrapped_callbacks_ids).lenght === 0) {
              delete listener.$$wrapped_callbacks_ids;
            }
          }

          return this.__Registration.removeListenerById(this, id);
        }
      }

      return false;
    },


    /**
     * Remove event listener from this object
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} reference to the 'this' variable inside the callback
     * @param capture {Boolean} Whether to remove the event listener of
     *   the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListener : function(type, listener, self, capture)
    {
      if (!this.$$disposed) {
        // special handling for wrapped once listener
        if (listener.$$wrapped_callback && listener.$$wrapped_callback[type + this.$$hash]) {
          var callback = listener.$$wrapped_callback[type + this.$$hash];
          delete listener.$$wrapped_callback[type + this.$$hash];
          listener = callback;
        }
        return this.__Registration.removeListener(this, type, listener, self, capture);
      }

      return false;
    },


    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param id {String} The id returned by {@link #addListener}
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListenerById : function(id)
    {
      if (!this.$$disposed) {
        return this.__Registration.removeListenerById(this, id);
      }

      return false;
    },


    /**
     * Check if there are one or more listeners for an event type.
     *
     * @param type {String} name of the event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the object has a listener of the given type.
     */
    hasListener : function(type, capture) {
      return this.__Registration.hasListener(this, type, capture);
    },


    /**
     * Dispatch an event on this object
     *
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt)
    {
      if (!this.$$disposed) {
        return this.__Registration.dispatchEvent(this, evt);
      }

      return true;
    },


    /**
     * Creates and dispatches an event on this object.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        return this.__Registration.fireEvent(this, type, clazz, args);
      }

      return true;
    },


    /**
     * Create an event object and dispatch it on this object.
     * The event dispatched with this method does never bubble! Use only if you
     * are sure that bubbling is not required.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireNonBubblingEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        return this.__Registration.fireNonBubblingEvent(this, type, clazz, args);
      }

      return true;
    },


    /**
     * Creates and dispatches an non-bubbling data event on this object.
     *
     * @param type {String} Event type to fire
     * @param data {var} User defined data attached to the event object
     * @param oldData {var?null} The event's old data (optional)
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireDataEvent : function(type, data, oldData, cancelable)
    {
      if (!this.$$disposed)
      {
        if (oldData === undefined) {
          oldData = null;
        }
        return this.__Registration.fireNonBubblingEvent(
          this, type, qx.event.type.Data, [data, oldData, !!cancelable]
        );
      }

      return true;
    }
  }
});
