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

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Very basic navigation manager. Still work in progress.
 *
 * Define routes to react on certain GET / POST / DELETE / PUT operations.
 *
 * * GET is triggered when the hash value of the url is changed. Can be called
 *   manually by calling the {@link #executeGet} method.
 * * POST / DELETE / PUT has to be triggered manually right now (will be changed later)
 *    by calling the {@link #executePost}, {@link #executeDelete}, {@link #executePut} method.
 *
 * This manager can also be used to provide browser history.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var nm = qx.ui.mobile.navigation.Manager.getInstance();
 *
 *   // show the start page, when no hash is given or the hash is "#/"
 *   nm.onGet("/", function(data) {
 *     startPage.show();
 *   },this);
 *
 *   // whenever the url /address is called show the addressbook page.
 *   nm.onGet("/address", function(data)
 *   {
 *     addressBookPage.show();
 *   },this);
 *
 *   // address with the parameter "id"
 *   nm.onGet("/address/:id", function(data)
 *   {
 *     addressPage.show();
 *     model.loadAddress(data.params.id);
 *   },this);
 *
 *   // make sure that the data is always loaded
 *   nm.onGet("/address.*", function(data)
 *   {
 *     if (!model.isLoaded()) {
 *       model.loadAddresses();
 *     }
 *   },this);
 *
 *   // update the address
 *   nm.onPost("/address/:id, function(data)
 *   {
 *     model.updateAddress(data.params.id);
 *   },this);
 *
 *   // delete the address and navigate back
 *   nm.onDelete("/address/:id, function(data)
 *   {
 *     model.deleteAddress(data.params.id);
 *     nm.executeGet("/address", {reverse:true});
 *   },this);
 * </pre>
 *
 * This example defines different routes to handle navigation events.
 *
 */
qx.Class.define("qx.ui.mobile.navigation.Manager",
{
  extend : qx.core.Object,
  type : "singleton",


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.__routes = {},
    this.__routesIdCount = 0;
    this.__operationToIdMapping = {};
    this.__history = [];
    this.__currentGetPath = null;


    this.__navigationHandler = new qx.ui.mobile.navigation.Handler(qx.ui.mobile.navigation.Manager.DEFAULT_PATH);

    this.__navigationHandler.addListener("changeHash", this.__onChangeHash, this);
    this.__navigationHandler.setHash(this.__navigationHandler.getLocationHash());
  },




 /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    DEFAULT_PATH : "/"
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __navigationHandler : null,

    __routes : null,
    __routesIdCount : null,
    __operationToIdMapping : null,
    __currentGetPath : null,

    __history : null,


    /**
     * Returns the current path behind the # hash.
     *
     * @return {String} The current hash path
     */
    getCurrentGetPath : function()
    {
      return this.__currentGetPath;
    },


    /**
     * Adds a route handler for the "get" operation. The route gets called
     * when the {@link #executeGet} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onGet : function(route, handler, scope)
    {
      return this._addRoute("get", route, handler, scope);
    },


    /**
     * Adds a route handler for the "post" operation. The route gets called
     * when the {@link #executePost} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onPost : function(route, handler, scope)
    {
      return this._addRoute("post", route, handler, scope);
    },


    /**
     * Adds a route handler for the "put" operation. The route gets called
     * when the {@link #executePut} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onPut : function(route, handler, scope)
    {
      return this._addRoute("put", route, handler, scope);
    },


    /**
     * Adds a route handler for the "delete" operation. The route gets called
     * when the {@link #executeDelete} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onDelete : function(route, handler, scope)
    {
      return this._addRoute("delete", route, handler, scope);
    },


    /**
     * Adds a route handler for the "any" operation. The "any" operation is called
     * before all other operations.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onAny : function(route, handler, scope)
    {
      return this._addRoute("any", route, handler, scope);
    },


    /**
     * Adds a route handler for a certain operation.
     *
     * @param operation {String} The operation the route should be registered for
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    _addRoute : function(operation, route, handler, scope)
    {
      var routes = this.__routes[operation] = this.__routes[operation] || {};
      var id = this.__routesIdCount++;
      var params = [];
      var param = null;

      // Convert the route to a regular expression.
      if (qx.lang.Type.isString(route))
      {
        var paramsRegexp = /:([\w\d]+)/g;

        while ((param = paramsRegexp.exec(route)) !== null) {
          params.push(param[1]);
        }
        route = new RegExp("^" + route.replace(paramsRegexp, "([^\/]+)") + "$");
      }

      routes[id] = {regExp:route, params:params, handler:handler, scope:scope};
      this.__operationToIdMapping[id] = operation;
      this._executeRoute(operation, this.__currentGetPath, routes[id]);
      return id;
    },


    /**
     * Removes a registered route by the given id.
     *
     * @param id {String} The id of the registered route
     */
    remove : function(id)
    {
      var operation = this.__operationToIdMapping[id];
      var routes = this.__routes[operation];
      delete routes[id];
      delete this.__operationToIdMapping[id];
    },


    /**
     * Hash change event handler.
     *
     * @param evt {qx.event.type.Data} The changeHash event.
     */
    __onChangeHash : function(evt)
    {
      var path = evt.getData();

      if (path != this.__currentGetPath)
      {
        this.executeGet(path, null);
      }
    },


    /**
     * Executes the get operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param customData {var} The given custom data that should be propagated
     */
    executeGet : function(path, customData)
    {
      this.__currentGetPath = path;

      var entry = this.__getFromHistory(path);
      if (entry)
      {
        this.debug("Path from history: " + path);
        if (!customData)
        {
          customData = entry.customData || {};
          customData.fromHistory = true;
        }
      } else {
        this.__addToHistory(path, customData);
      }

      this.__navigationHandler.setHash(path);
      this._execute("get", path, null, customData);
    },


    /**
     * Executes the post operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    executePost : function(path, params, customData)
    {
      this._execute("post", path, params, customData);
    },


    /**
     * Executes the put operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    executePut : function(path, params, customData)
    {
      this._execute("put", path, params, customData);
    },


    /**
     * Executes the delete operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    executeDelete : function(path, params, customData)
    {
      this._execute("delete", path, params, customData);
    },


    /**
     * Adds the custom data of a given path to the history.
     *
     * @param path {String} The path to store.
     * @param customData {var} The custom data to store
     */
    __addToHistory : function(path, customData)
    {
      this.debug("Add path " + path + " to history");
      this.__history.unshift({
        path : path,
        customData :customData
      });
    },


    /**
     * Returns a history entry for a certain path.
     *
     * @param path {String} The path of the entry
     * @return {Map} The retrieved entry. <code>null</code> when no entry was found.
     */
    __getFromHistory : function(path)
    {
      var history = this.__history;
      var length = history.length;
      var entry = null;
      for (var i = 0; i < length; i++)
      {
        if (history[i].path == path)
        {
          entry = history[i];
          history.splice(0,i);
          break;
        }
      }
      return entry;
    },


    /**
     * Executes a certain operation with a given path. Informs all
     * route handlers that match with the path.
     *
     * @param operation {String} The operation to execute.
     * @param path {String} The path to check
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _execute : function(operation, path, params, customData)
    {
      this.debug("Execute " + operation + " for path " + path);
      var routeMatchedAny = false;
      var routes = this.__routes["any"];
      routeMatchedAny = this._executeRoutes(operation, path, routes, params, customData);

      var routeMatched = false;
      var routes = this.__routes[operation];
      routeMatched = this._executeRoutes(operation, path, routes, params, customData);

      if (!routeMatched && !routeMatchedAny) {
        this.info("No route found for " + path);
      }
    },


    /**
     * Executes all given routes for a certain operation. Checks all routes if they match with the given path and
     * executes the stored handler of the matching route.
     *
     * @param operation {String} The operation to execute.
     * @param path {String} The path to check
     * @param routes {Map[]} All routes to test and execute.
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _executeRoutes : function(operation, path, routes, params, customData)
    {
      if (!routes || qx.lang.Object.isEmpty(routes)) {
        return true;
      }
      var routeMatched = false;
      for (var id in routes)
      {
        var route = routes[id];
        routeMatched = this._executeRoute(operation, path, route, params, customData);
      }
      return routeMatched;
    },


    /**
     * Executes a certain route. Checks if the route matches the given path and
     * executes the stored handler of the route.
     *
     * @param operation {String} The operation to execute.
     * @param path {String} The path to check
     * @param route {Map} The route data.
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     *
     * @return {Boolean} Whether the route has been executed
     */
    _executeRoute : function(operation, path, route, params, customData)
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
          value = this._decode(match[i]);
          param = route.params[i];
          if (param) {
            params[param] = value;
          } else {
            params[i] = value;
          }
        }
        this.debug("Execute " + operation + " handler for path " + path + " and route " + route.regExp.toString());
        route.handler.call(route.scope, {path:path, params:params, customData:customData});
      }
      return match;
    },


    /**
     * Encodes a given value.
     *
     * @param value {String} The value to encode
     * @return {String} The encoded value
     */
    _encode : function(value)
    {
      return encodeURIComponent(value);
    },


    /**
     * Decodes a given value.
     *
     * @param value {String} The value to decode
     * @return {String} The decoded value
     */
    _decode : function(value)
    {
      return decodeURIComponent(value);
    },


    /**
     * Returns all routes.
     *
     * @return {Map} The registered routes.
     */
    _getRoutes : function()
    {
      return this.__routes;
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__navigationHandler.removeListener("changeHash", this.__onChangeHash, this);
    this.__history = this.__routes = this.__operationToIdMapping = null;
    this._disposeObjects("__navigationHandler");
  }
});