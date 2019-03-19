/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger

************************************************************************ */

/**
 * A simple message bus singleton.
 * The message bus registers subscriptions and notifies subscribers when
 * a matching message is dispatched
 */
qx.Class.define("qx.event.message.Bus",
{
  type : "singleton",

  extend : qx.core.Object,

  statics :
  {

    /**
     * gets the hash map of message subscriptions
     *
     * @return {Map} with registered subscriptions. The key is the
     *    <code>message</code> and the value is a map with <code>{subscriber: {Function},
     *    context: {Object|null}}</code>.
     */
    getSubscriptions : function() {
      return this.getInstance().getSubscriptions();
    },


    /**
     * subscribes to a message
     *
     * @param message {String} name of message, can be truncated by *
     * @param subscriber {Function} subscribing callback function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribe : function(message, subscriber, context)
    {
      return this.getInstance().subscribe(message, subscriber, context);

    },

    /**
     * checks if subscription is already present
     * if you supply the callback function, match only the exact message monitor
     * otherwise match all monitors that have the given message
     *
     * @param message {String} Name of message, can be truncated by *
     * @param subscriber {Function} Callback Function
     * @param context {Object} execution context
     * @return {Boolean} Whether monitor is present or not
     */
    checkSubscription : function(message, subscriber, context)
    {
      return this.getInstance().checkSubscription(message, subscriber, context);
    },

    /**
     * unsubscribe a listening method
     * if you supply the callback function and execution context,
     * remove only this exact subscription
     * otherwise remove all subscriptions
     *
     * @param message {String} Name of message, can be truncated by *
     * @param subscriber {Function} Callback Function
     * @param context {Object} execution context
     * @return {Boolean} Whether monitor was removed or not
     */
    unsubscribe : function(message, subscriber, context)
    {
      return this.getInstance().unsubscribe(message, subscriber, context);
    },

    /**
     * dispatch message and call subscribed functions
     *
     * @param msg {qx.event.message.Message} message which is being dispatched
     * @return {Boolean} <code>true</code> if the message was dispatched,
     *    <code>false</code> otherwise.
     */
    dispatch : function(msg)
    {
      return this.getInstance().dispatch.apply(this.getInstance(), arguments);
    },

    /**
     * Dispatches a new message by supplying the name of the
     * message and its data.
     *
     * @param name {String} name of the message
     * @param data {var} Any type of data to attach
     *
     * @return {Boolean} <code>true</code> if the message was dispatched,
     *    <code>false</code> otherwise.
     */
    dispatchByName : function(name, data)
    {
      return this.getInstance().dispatchByName.apply(this.getInstance(), arguments);
    }
  },

  /**
   * constructor
   */
  construct : function()
  {
    /*
     * message subscriptions database
     */
    this.__subscriptions = {};
  },

  members :
  {
    __subscriptions : null,


    /**
     * gets the hash map of message subscriptions
     *
     * @return {Map} with registered subscriptions. The key is the
     *    <code>message</code> and the value is a map with <code>{subscriber: {Function},
     *    context: {Object|null}}</code>.
     */
    getSubscriptions : function() {
      return this.__subscriptions;
    },


    /**
     * subscribes to a message
     *
     * @param message {String} name of message, can be truncated by *
     * @param subscriber {Function} subscribing callback function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribe : function(message, subscriber, context)
    {
      if (!message || typeof subscriber != "function")
      {
        this.error("Invalid parameters! "+ [message, subscriber, context]);

        return false;
      }

      var sub = this.getSubscriptions();

      if (this.checkSubscription(message))
      {
        if (this.checkSubscription(message, subscriber, context))
        {
          this.warn("Object method already subscribed to " + message);
          return false;
        }

        // add a subscription
        sub[message].push(
        {
          subscriber : subscriber,
          context    : context || null
        });

        return true;
      }
      else
      {
        // create a subscription
        sub[message] = [ {
          subscriber : subscriber,
          context    : context || null
        } ];

        return true;
      }
    },


    /**
     * checks if subscription is already present
     * if you supply the callback function, match only the exact message monitor
     * otherwise match all monitors that have the given message
     *
     * @param message {String} Name of message, can be truncated by *
     * @param subscriber {Function} Callback Function
     * @param context {Object} execution context
     * @return {Boolean} Whether monitor is present or not
     */
    checkSubscription : function(message, subscriber, context)
    {
      var sub = this.getSubscriptions();

      if (!sub[message] || sub[message].length === 0) {
        return false;
      }

      if (subscriber)
      {
        for (var i=0; i<sub[message].length; i++)
        {
          if (sub[message][i].subscriber === subscriber && sub[message][i].context === (context || null)) {
            return true;
          }
        }

        return false;
      }

      return true;
    },


    /**
     * unsubscribe a listening method
     * if you supply the callback function and execution context,
     * remove only this exact subscription
     * otherwise remove all subscriptions
     *
     * @param message {String} Name of message, can be truncated by *
     * @param subscriber {Function} Callback Function
     * @param context {Object} execution context
     * @return {Boolean} Whether monitor was removed or not
     */
    unsubscribe : function(message, subscriber, context)
    {
       var sub = this.getSubscriptions();
       var subscrList = sub[message];
       if (subscrList) {
         if (!subscriber) {
           sub[message] = null;
           delete sub[message];
           return true;
         } else {
           if (! context) {
             context = null;
           }
           var i = subscrList.length;
           var subscription;
           do {
             subscription = subscrList[--i];
             if (subscription.subscriber === subscriber && subscription.context === context) {
               subscrList.splice(i, 1);
               if (subscrList.length === 0) {
                 sub[message] = null;
                 delete sub[message];
               }
               return true;
             }
           } while (i);
         }
       }
       return false;
    },

    /**
     * dispatch message and call subscribed functions
     *
     * @param msg {qx.event.message.Message} message which is being dispatched
     * @return {Boolean} <code>true</code> if the message was dispatched,
     *    <code>false</code> otherwise.
     */
    dispatch : function(msg)
    {
      var sub = this.getSubscriptions();
      var msgName = msg.getName();
      var dispatched = false;

      for (var key in sub)
      {
        var pos = key.indexOf("*");

        if (pos > -1)
        {
          // use of wildcard
          if (pos === 0 || key.substr(0, pos) === msgName.substr(0, pos))
          {
            this.__callSubscribers(sub[key], msg);
            dispatched = true;
          }
        }
        else
        {
          // exact match
          if (key === msgName)
          {
            this.__callSubscribers(sub[msgName], msg);
            dispatched = true;
          }
        }
      }

      return dispatched;
    },

    /**
     * Dispatches a new message by supplying the name of the
     * message and its data.
     *
     * @param name {String} name of the message
     * @param data {var} Any type of data to attach
     *
     * @return {Boolean} <code>true</code> if the message was dispatched,
     *    <code>false</code> otherwise.
     */
    dispatchByName : function(name, data)
    {
      var message = new qx.event.message.Message(name, data);

      // Dispatch the message
      var ret = this.dispatch(message);

      // We instantiated this message, so it's our responsibility to dispose it.
      message.dispose();
      message = null;

      // Let 'em know whether this message was dispatched to any subscribers.
      return ret;
    },


    /**
     * Call subscribers with passed message.
     *
     * Each currently-subscribed subscriber function will be called in
     * turn. Any requests to unsubscribe a subscriber from the list, while
     * processing the currently-subscribed subscriber functions, will take
     * effect after all currently-subscribed subscriber functions have been
     * processed.
     *
     * @param subscribers {Array} subscribers to call
     * @param msg {qx.event.message.Message} message for subscribers
     */
    __callSubscribers : function(subscribers, msg)
    {
      // (Shallow) clone the subscribers array in case one of them alters the
      // list, e.g., by unsubscribing
      subscribers = subscribers.slice();

      for (var i=0; i<subscribers.length; i++)
      {
        var subscriber = subscribers[i].subscriber;
        var context = subscribers[i].context;

        // call message monitor subscriber
        if (context && context.isDisposed)
        {
          if (context.isDisposed())
          {
            subscribers.splice(i, 1);
            i--;
          }
          else
          {
            subscriber.call(context, msg);
          }
        }
        else
        {
          subscriber.call(context, msg);
        }
      }
    }
  }
});
