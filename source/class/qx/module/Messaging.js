/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Define messages to react on certain channels.
 *
 * The channel names will be used in the q.messaging.on method to define handlers which will
 * be called on certain channels and routes. The q.messaging.emit method can be used
 * to execute a given route on a channel. q.messaging.onAny defines a handler on any channel.
 *
 * @require(qx.event.Messaging#on)
 * @require(qx.event.Messaging#onAny)
 * @require(qx.event.Messaging#remove)
 * @require(qx.event.Messaging#emit)
 */
qx.Bootstrap.define("qx.module.Messaging", {
  statics: {
    /**
     * Adds a route handler for the given channel. The route is called
     * if the {@link #emit} method finds a match.
     *
     * @attachStatic{qxWeb, messaging.on}
     * @param channel {String} The channel of the message.
     * @param type {String|RegExp} The type, used for checking if the executed path matches.
     * @param handler {Function} The handler to call if the route matches the executed path.
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     * @signature function(channel, type, handler, scope)
     */
    on : null,


    /**
     * Adds a handler for the "any" channel. The "any" channel is called
     * before all other channels.
     *
     * @attachStatic{qxWeb, messaging.onAny}
     * @param type {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call if the route matches the executed path
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     * @signature function(type, handler, scope)
     */
    onAny : null,


    /**
     * Removes a registered listener by the given id.
     *
     * @attachStatic{qxWeb, messaging.remove}
     * @param id {String} The id of the registered listener.
     * @signature function(id)
     */
    remove : null,


    /**
     * Sends a message on the given channel and informs all matching route handlers.
     *
     * @attachStatic{qxWeb, messaging.emit}
     * @param channel {String} The channel of the message.
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     * @signature function(channel, path, params, customData)
     */
    emit : null
  },


  defer : function(statics) {
    qxWeb.$attachStatic({
      "messaging" : new qx.event.Messaging()
    });
  }
});
