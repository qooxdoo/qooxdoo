/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)
     * Sebastian Werner (wpbasti)
     * Christian Hagendorn (chris_schmidt)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A simple message bus singleton.
 * The message bus registers subscriptions to topics and notifies subscribers when
 * a matching message is dispatched. A topic acts as a filter to select only those
 * messages which match the filter. It can be the name of a message, which can
 * terminated with a trailing `*` as a wildcard, or a regular expression.
 */
qx.Class.define("qx.event.message.Bus",
{
  type : "singleton",

  extend : qx.core.Object,

  statics :
  {

    /**
     * Shorthand method for {@link qx.event.message.Bus.getSubscription}
     * @return {Object}
     */
    getSubscriptions : function() {
      return this.getInstance().getSubscriptions();
    },

    /**
     * Shorthand method for {@link qx.event.message.Bus.subscribe}
     * @param topic {String|RegExp}
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribe : function(topic, subscriber, context)
    {
      return this.getInstance().subscribe.apply(this.getInstance(), arguments);
    },

    /**
     * Shorthand method for {@link qx.event.message.Bus.subscribeOnce}
     * @param topic {String|RegExp}
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribeOnce : function(topic, subscriber, context)
    {
      return this.getInstance().subscribeOnce.apply(this.getInstance(), arguments);
    },

    /**
     * Shorthand method for {@link qx.event.message.Bus.checkSubscription}
     * @param topic {String|RegExp} The topic that has been used when subscribing
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Whether a subscription was removed
     */
    checkSubscription : function(topic, subscriber, context)
    {
      return this.getInstance().checkSubscription.apply(this.getInstance(), arguments);
    },

    /**
     * Shorthand method for {@link qx.event.message.Bus.unsubscribe}
     * @param topic {String|RegExp} The topic that has been used when subscribing
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Whether a subscription was removed
     */
    unsubscribe : function(topic, subscriber, context)
    {
      return this.getInstance().unsubscribe.apply(this.getInstance(), arguments);
    },

    /**
     * Shorthand method for {@link qx.event.message.Bus.dispatch}
     * @param message {qx.event.message.Message} Message which is being dispatched
     * @return {Boolean} If the message could be dispatched
     */
    dispatch : function(message)
    {
      return this.getInstance().dispatch.apply(this.getInstance(), arguments);
    },

    /**
     * Shorthand method for {@link qx.event.message.Bus.dispatchByName}
     * @param name {String} name of the message
     * @param data {var} Any type of data to attach
     * @return {Boolean} If the message was dispatched
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
    this.base(arguments);
    this.__subscriptions = {};
  },

  members :
  {
    /**
     * Subscriptions cache
     * @var {Object}
     */
    __subscriptions : null,

    /**
     * Returns the map of message subscriptions with registered subscriptions. The key is
     * the topic and the value is a map with <code>{subscriber:
     * {Function}, context: {Object|null}}</code>.
     *
     * @return {Object}
     */
    getSubscriptions : function() {
      return this.__subscriptions;
    },


    /**
     * Subscribes to a topic
     *
     * @param topic {String|RegExp} Either a string, which can be
     * terminated with a trailing `*` as a wildcard to match all message
     * names that start with the prefix, or a regular expression
     * object, which the message name has to match. If you use regular
     * expressions, you cannot use message names that start and end
     * with a slash ("/") at the same time, because regular expressions
     * are converted to their string representation when stored.
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribe : function(topic, subscriber, context)
    {
      if (!topic || typeof subscriber != "function")
      {
        throw new Error("Invalid parameters! "+ [topic, subscriber, context]); // since v6.0.0
      }

      // handle regexes
      var regex = topic instanceof RegExp ? topic : null;
      topic = topic.toString();

      var sub = this.getSubscriptions();

      if (this.checkSubscription(topic))
      {
        if (this.checkSubscription(topic, subscriber, context))
        {
          this.warn("Object method already subscribed to " + topic);
          return false;
        }

        // add a subscription
        sub[topic].push(
        {
          regex      : regex,
          subscriber : subscriber,
          context    : context || null
        });

        return true;
      }
      else
      {
        // create a subscription
        sub[topic] = [ {
          regex      : regex,
          subscriber : subscriber,
          context    : context || null
        } ];

        return true;
      }
    },

    /**
     * Subscribes to a topic just for one dispatch and automatically unsubscribes
     * after executing the message handler. This subscription cannot be unsubscribed
     * from after it has been registered.

     *
     * @param topic {String|RegExp} Topic to subscribe to. see {@link qx.event.message.Bus#subscribe}
     * for details
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribeOnce : function(topic, subscriber, context)
    {
      var that = this;
      var modified_subscriber = function(message) {
        subscriber.call(context, message);
        that.unsubscribe(topic, modified_subscriber, context);
      }
      return this.subscribe(topic, modified_subscriber, context);
    },

    /**
     * Checks if subscription is already present. If you supply
     * the message handler function, match only this exact subscription,
     * otherwise any topic subscription will match.
     *
     * @param topic {String|RegExp} Either a string, which can be truncated by `*`
     * to match all message names that start with the prefix, or a regular expression
     * object, which the message name has to match.
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Whether a subscription exists for the topic
     */
    checkSubscription : function(topic, subscriber, context)
    {
      var topic = topic.toString();
      var sub = this.getSubscriptions();

      if (!sub[topic] || sub[topic].length === 0) {
        return false;
      }

      if (subscriber)
      {
        for (var i=0; i<sub[topic].length; i++)
        {
          if (sub[topic][i].subscriber === subscriber && sub[topic][i].context === (context || null)) {
            return true;
          }
        }

        return false;
      }

      return true;
    },


    /**
     * Unsubscribe from a topic.
     *
     * If a "wildcard" topic was subscribed to with a trailing asterisk,
     * because the subscriber wanted to receive messages for any topic
     * with the given prefix, that same "wildcard" topic should be used to
     * unsubscribe. It is not possible to unsubscribe using any topic other
     * than one exactly matching one that has previously been subscribed to.
     *
     * If you supply the callback function and execution context, only this
     * exact subscription is removed. Otherwise, all subscriptions to this topic
     * will be removed.
     *
     * @param topic {String|RegExp} The topic that has been used when subscribing
     * @param subscriber {Function} Message handler function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Whether a subscription was removed
     */
    unsubscribe : function(topic, subscriber, context)
    {
       var topic = topic.toString();
       var sub = this.getSubscriptions();
       var subscrList = sub[topic];
       if (subscrList) {
         if (!subscriber) {
           sub[topic] = null;
           delete sub[topic];
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
                 sub[topic] = null;
                 delete sub[topic];
               }
               return true;
             }
           } while (i);
         }
       }
       return false;
    },

    /**
     * Dispatch message, which calls subscribers
     *
     * @param message {qx.event.message.Message} Message which is being dispatched
     * @return {Boolean} If the message could be dispatched, i.e. if subscribers
     * exist which have received the message
     */
    dispatch : function(message)
    {
      var sub = this.getSubscriptions();
      var msgName = message.getName();
      var dispatched = false;

      for (var topic in sub)
      {
        var len = topic.length;
        if (topic[len-1] === "*")
        {
          // use of wildcard, only allowed as "*" or at the end of the topic
          if (len === 1 || topic.substr(0, len-2) === msgName.substr(0, len-2))
          {
            this.__callSubscribers(sub[topic], message);
            dispatched = true;
          }
        }
        else if (sub[topic][0].regex)
        {
          // regular expression
          if (message.getName().match(sub[topic][0].regex)) {
            this.__callSubscribers(sub[topic], message);
            dispatched = true;
          }
        }
        else if (topic === msgName)
        {
          // exact match
          this.__callSubscribers(sub[topic], message);
          dispatched = true;
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
     * @return {Boolean} If the message was dispatched
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
     * Removes all subscriptions
     */
    removeAllSubscriptions : function() {
      var subscriptions = this.getSubscriptions();
      for (var key in subscriptions) {
        delete subscriptions[key];
      }
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
     * @param message {qx.event.message.Message} message for subscribers
     */
    __callSubscribers : function(subscribers, message)
    {
      // (Shallow) clone the subscribers array in case one of them alters the
      // list, e.g., by unsubscribing
      subscribers = subscribers.slice();

      for (var i=0; i<subscribers.length; i++)
      {
        var subscriber = subscribers[i].subscriber;
        var context = subscribers[i].context;

        // call topic subscriber
        if (context && context.isDisposed)
        {
          if (context.isDisposed())
          {
            subscribers.splice(i, 1);
            i--;
          }
          else
          {
            subscriber.call(context, message);
          }
        }
        else
        {
          subscriber.call(context, message);
        }
      }
    }
  }
});
