/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Christian Boulanger

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger

************************************************************************ */

/* ************************************************************************

#module(event.message)

************************************************************************ */

/**
 * A simple message bus singleton.
 * The message bus registers subscriptions and notifies subscribers when
 * a matching message is dispatched
 */
qx.Class.define("qx.event.message.Bus",
{
  statics :
  {
    /**
     * message subscriptions database
     */
    __subscriptions : {},


    /**
     * gets the hash map of message subscriptions
     *
     * @type static
     * @return {Object} TODOC
     */
    getSubscriptions : function() {
      return this.__subscriptions;
    },


    /**
     * subscribes to a message
     *
     * @type static
     * @param message {String} name of message, can be truncated by *
     * @param subscriber {Function} subscribing callback function
     * @param context {Object} The execution context of the callback (i.e. "this")
     * @return {Boolean} Success
     */
    subscribe : function(message, subscriber, context)
    {
      if (!message || typeof subscriber != "function")
      {
        this.error("Invalid parameters!");
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
        sub[message] = [
        {
          subscriber : subscriber,
          context    : context || null
        } ];

        return true;
      }
    },


    /**
     * checks if subsciption is already present
     * if you supply the callback function, match only the exact message monitor
     * otherwise match all monitors that have the given message
     *
     * @type static
     * @param message {String} Name of message, can be truncated by *
     * @param subscriber {Function} Callback Function
     * @param context {Object} execution context
     * @return {Boolean} Whether monitor is present or not
     */
    checkSubscription : function(message, subscriber, context)
    {
      var sub = this.getSubscriptions();

      if (!sub[message] || sub[message].length == 0) {
        return false;
      }

      if (subscriber)
      {
        for (var i=0; i<sub[message].length; i++)
        {
          if (sub[message][i].subscriber == subscriber && sub[message][i].context == (context || null)) {
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
     * @type static
     * @param message {String} Name of message, can be truncated by *
     * @param subscriber {Function} Callback Function
     * @param context {Object} execution context
     * @return {Boolean} Whether monitor was removed or not
     */
    unsubscribe : function(message, subscriber, context)
    {
      var sub = this.getSubscriptions();

      if (!sub[message]) {
        return false;
      }

      if (subscriber)
      {
        for (var i=0; i<sub[message].length; i++)
        {
          if (sub[message][i].subscriber == subscriber && sub[message][i].context == (context || null))
          {
            sub[message].splice(i, 1);
            return true;
          }
        }
      }

      sub[message] = null;
      return true;
    },


    /**
     * dispatch message and call subscribed functions
     *
     * @type static
     * @param msg {qx.messagebus.Message|String} message which is being dispatched
     * @return {boolean} TODOC
     */
    dispatch : function(msg)
    {
      // if string value has been supplied, create new message
      if ( typeof msg == "string" )
      {
        var value = typeof arguments[1] != "undefined" ? arguments[1] : true;
        msg = new qx.event.message.Message( msg, value );
      }

      var sub = this.getSubscriptions();
      var msgName = msg.getName();

      for (var key in sub)
      {
        var pos = key.indexOf("*");

        if (pos > -1)
        {
          // use of wildcard
          if (pos == 1 || key.substr(0, pos) == msgName.substr(0, pos))
          {
            for (var i=0; i<sub[key].length; i++)
            {
              var subscriber = sub[key][i].subscriber;
              var context = sub[key][i].context;

              // call message monitor subscriber
              subscriber.call(context, msg);
            }
          }
        }
        else
        {
          // exact match
          if (key == msgName)
          {
            for (var i=0; i<sub[msgName].length; i++)
            {
              var subscriber = sub[msgName][i].subscriber;
              var context = sub[msgName][i].context;

              // call message monitor subscriber
              subscriber.call(context, msg);
            }

            return true;
          }
        }
      }
    }
  }
});
