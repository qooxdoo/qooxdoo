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
 * be called on certain channels and routes. The {@link #execue} methods can be used
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
 *   m.execue("get", "/address/1234");
 * </pre>
 */
qx.Bootstrap.define("qx.event.Messaging",
{
  construct : function()
  {
    this._routes = {},
    this.__routesIdCount = 0;
    this.__channelToIdMapping = {};
  },


  statics : {
    DEFAULT_PATH : "/"
  },



  members :
  {
    _routes : null,
    __routesIdCount : null,
    __channelToIdMapping : null,


    /**
     * Adds a route handler for the given channel. The route gets called
     * when the {@link #execute} method found a match.
     *
     * @param channel {String} The channel of the message.
     * @param route {String|RegExp} The route, used for checking if the executed path matches.
     * @param handler {Function} The handler to call, when the route matches with the executed path.
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     */
    on : function(channel, route, handler, scope) {
      return this._addRoute(channel, route, handler, scope);
    },



    /**
     * Adds a route handler for the "any" channel. The "any" channel is called
     * before all other channels.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     */
    onAny : function(route, handler, scope) {
      return this._addRoute("any", route, handler, scope);
    },


    /**
     * Adds a route handler for a certain channel.
     *
     * @param channel {String} The channel the route should be registered for
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {var ? null} The scope of the handler.
     * @return {String} The id of the route used to remove the route.
     */
    _addRoute : function(channel, route, handler, scope) {
      var routes = this._routes[channel] = this._routes[channel] || {};
      var id = this.__routesIdCount++;
      var params = [];
      var param = null;

      // Convert the route to a regular expression.
      if (qx.lang.Type.isString(route))
      {
        var paramsRegexp = /\{([\w\d]+)\}/g;

        while ((param = paramsRegexp.exec(route)) !== null) {
          params.push(param[1]);
        }
        route = new RegExp("^" + route.replace(paramsRegexp, "([^\/]+)") + "$");
      }

      routes[id] = {regExp:route, params:params, handler:handler, scope:scope};
      this.__channelToIdMapping[id] = channel;
      return id;
    },


    /**
     * Removes a registered route by the given id.
     *
     * @param id {String} The id of the registered route
     */
    remove : function(id)
    {
      var channel = this.__channelToIdMapping[id];
      var routes = this._routes[channel];
      delete routes[id];
      delete this.__channelToIdMapping[id];
    },


    /**
     * Executes the channel and informs all matching route handler.
     *
     * @param channel {String} The channel of the message.
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    execute : function(channel, path, params, customData) {
      this._execute(channel, path, params, customData);
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
    _execute : function(channel, path, params, customData)
    {
      var routeMatchedAny = false;
      var routes = this._routes["any"];
      routeMatchedAny = this._executeRoutes(channel, path, routes, params, customData);

      var routeMatched = false;
      var routes = this._routes[channel];
      routeMatched = this._executeRoutes(channel, path, routes, params, customData);

      if (!routeMatched && !routeMatchedAny) {
        this.info("No route found for " + path);
      }
    },


    /**
     * Executes all given routes for a certain channel. Checks all routes if they match with the given path and
     * executes the stored handler of the matching route.
     *
     * @param channel {String} The channel to execute.
     * @param path {String} The path to check
     * @param routes {Map[]} All routes to test and execute.
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _executeRoutes : function(channel, path, routes, params, customData)
    {
      if (!routes || qx.lang.Object.isEmpty(routes)) {
        return true;
      }
      var routeMatched = false;
      for (var id in routes)
      {
        var route = routes[id];
        routeMatched = this._executeRoute(channel, path, route, params, customData);
      }
      return routeMatched;
    },


    /**
     * Executes a certain route. Checks if the route matches the given path and
     * executes the stored handler of the route.
     *
     * @param channel {String} The channel to execute.
     * @param path {String} The path to check
     * @param route {Map} The route data.
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _executeRoute : function(channel, path, route, params, customData)
    {
      var match = route.regExp.exec(path);
      if (match)
      {
        var params = params || {};
        var param = null;
        var value = null;
        match.shift(); // first match is the whole path
        for (var i=0; i < match.length; i++)
        {
          value = match[i];
          param = route.params[i];
          if (param) {
            params[param] = value;
          } else {
            params[i] = value;
          }
        }
        route.handler.call(route.scope, {path:path, params:params, customData:customData});
      }
      return match;
    }
  }
});