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
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Define messages to react on certain channels.
 *
 * The channel names will be used in the {@link #on} method to define handlers which will
 * be called on certain channels and routes. The {@link #emit} method can be used
 * to execute a given route on a channel. {@link #onAny} defines a handler on any channel.
 *
 * *Example*
 *
 * Here is a little example of how to use the messaging.
 *
 * <pre class='javascript'>
 *   var m = new qx.event.Messaging();
 *
 *   m.on("get", "/address/{id}", function(data) {
 *     var id = data.params.id; // 1234
 *     // do something with the id...
 *   },this);
 *
 *   m.emit("get", "/address/1234");
 * </pre>
 */
qx.Bootstrap.define("qx.event.Messaging",
{
  construct : function()
  {
    this._listener = {},
    this.__listenerIdCount = 0;
    this.__channelToIdMapping = {};
  },


  members :
  {
    _listener : null,
    __listenerIdCount : null,
    __channelToIdMapping : null,


    /**
     * Adds a route handler for the given channel. The route is called
     * if the {@link #emit} method finds a match.
     *
     * @param channel {String} The channel of the message.
     * @param type {String|RegExp} The type, used for checking if the executed path matches.
     * @param handler {Function} The handler to call if the route matches the executed path.
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     */
    on : function(channel, type, handler, scope) {
      return this._addListener(channel, type, handler, scope);
    },



    /**
     * Adds a handler for the "any" channel. The "any" channel is called
     * before all other channels.
     *
     * @param type {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call if the route matches the executed path
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     */
    onAny : function(type, handler, scope) {
      return this._addListener("any", type, handler, scope);
    },


    /**
     * Adds a listener for a certain channel.
     *
     * @param channel {String} The channel the route should be registered for
     * @param type {String|RegExp} The type, used for checking if the executed path matches
     * @param handler {Function} The handler to call if the route matches the executed path
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     */
    _addListener : function(channel, type, handler, scope) {
      var listeners = this._listener[channel] = this._listener[channel] || {};
      var id = this.__listenerIdCount++;
      var params = [];
      var param = null;

      // Convert the route to a regular expression.
      if (qx.lang.Type.isString(type))
      {
        var paramsRegexp = /\{([\w\d]+)\}/g;

        while ((param = paramsRegexp.exec(type)) !== null) {
          params.push(param[1]);
        }
        type = new RegExp("^" + type.replace(paramsRegexp, "([^\/]+)") + "$");
      }

      listeners[id] = {regExp:type, params:params, handler:handler, scope:scope};
      this.__channelToIdMapping[id] = channel;
      return id;
    },


    /**
     * Removes a registered listener by the given id.
     *
     * @param id {String} The id of the registered listener.
     */
    remove : function(id) {
      var channel = this.__channelToIdMapping[id];
      var listener = this._listener[channel];
      delete listener[id];
      delete this.__channelToIdMapping[id];
    },


    /**
     * Sends a message on the given channel and informs all matching route handlers.
     *
     * @param channel {String} The channel of the message.
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    emit : function(channel, path, params, customData) {
      this._emit(channel, path, params, customData);
    },


    /**
     * Executes a certain channel with a given path. Informs all
     * route handlers that match with the path.
     *
     * @param channel {String} The channel to execute.
     * @param path {String} The path to check
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _emit : function(channel, path, params, customData)
    {
      var listenerMatchedAny = false;
      var listener = this._listener["any"];
      listenerMatchedAny = this._emitListeners(channel, path, listener, params, customData);

      var listenerMatched = false;
      listener = this._listener[channel];
      listenerMatched = this._emitListeners(channel, path, listener, params, customData);

      if (!listenerMatched && !listenerMatchedAny) {
        qx.Bootstrap.info("No listener found for " + path);
      }
    },


    /**
     * Executes all given listener for a certain channel. Checks all listeners if they match
     * with the given path and executes the stored handler of the matching route.
     *
     * @param channel {String} The channel to execute.
     * @param path {String} The path to check
     * @param listeners {Map[]} All routes to test and execute.
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _emitListeners : function(channel, path, listeners, params, customData)
    {
      if (!listeners || qx.lang.Object.isEmpty(listeners)) {
        return false;
      }
      var listenerMatched = false;
      for (var id in listeners)
      {
        var listener = listeners[id];
        listenerMatched = this._emitRoute(channel, path, listener, params, customData);
      }
      return listenerMatched;
    },


    /**
     * Executes a certain listener. Checks if the listener matches the given path and
     * executes the stored handler of the route.
     *
     * @param channel {String} The channel to execute.
     * @param path {String} The path to check
     * @param listener {Map} The route data.
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _emitRoute : function(channel, path, listener, params, customData)
    {
      var match = listener.regExp.exec(path);
      if (match)
      {
        var params = params || {};
        var param = null;
        var value = null;
        match.shift(); // first match is the whole path
        for (var i=0; i < match.length; i++)
        {
          value = match[i];
          param = listener.params[i];
          if (param) {
            params[param] = value;
          } else {
            params[i] = value;
          }
        }
        listener.handler.call(listener.scope, {path:path, params:params, customData:customData});
      }
      return match;
    }
  }
});