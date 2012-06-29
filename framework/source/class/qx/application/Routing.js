/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Tino Butz (tbtz)

************************************************************************ */

/**
*
 * Basic application routing manager.
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
 *   var r = new qx.application.Routing();
 *
 *   // show the start page, when no hash is given or the hash is "#/"
 *   r.onGet("/", function(data) {
 *     startPage.show();
 *   }, this);
 *
 *   // whenever the url /address is called show the addressbook page.
 *   r.onGet("/address", function(data) {
 *     addressBookPage.show();
 *   }, this);
 *
 *   // address with the parameter "id"
 *   r.onGet("/address/{id}", function(data) {
 *     addressPage.show();
 *     model.loadAddress(data.params.id);
 *   }, this);
 *
 *   // Alternative you can use regExp for a route
 *   r.onGet(/address\/(.*)/, function(data) {
 *     addressPage.show();
 *     model.loadAddress(data.params.0);
 *   }, this);
 *
 *   // make sure that the data is always loaded
 *   r.onGet("/address.*", function(data) {
 *     if (!model.isLoaded()) {
 *       model.loadAddresses();
 *     }
 *   }, this);
 *
 *   // update the address
 *   r.onPost("/address/{id}", function(data) {
 *     model.updateAddress(data.params.id);
 *   }, this);
 *
 *   // delete the address and navigate back
 *   r.onDelete("/address/{id}", function(data) {
 *     model.deleteAddress(data.params.id);
 *     r.executeGet("/address", {reverse:true});
 *   }, this);
 * </pre>
 *
 * This example defines different routes to handle navigation events.
 */
qx.Bootstrap.define("qx.application.Routing", {

  construct : function()
  {
    this.__back = [];
    this.__forward = [];
    this.__messaging = new qx.event.Messaging();

    this.__navigationHandler = qx.bom.History.getInstance();
    this.__navigationHandler.addListener("changeState", this.__onChangeHash, this);
  },


  statics : {
    DEFAULT_PATH : "/"
  },


  members :
  {
    __navigationHandler : null,
    __messaging : null,

    __back : null,
    __forward : null,

    __currentGetPath : null,


    /**
     * Initialization method used to execute the get route for the currently set history path.
     */
    init : function() {
      var path = this.__navigationHandler.getState();
      if (path == "" || path == null){
        path = qx.application.Routing.DEFAULT_PATH;
      }
      this._executeGet(path, null, true);
    },


    /**
     * Adds a route handler for the "get" operation. The route gets called
     * when the {@link #executeGet} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches.
     * @param handler {Function} The handler to call, when the route matches with the executed path.
     * @param scope {Object} The scope of the handler.
     */
    onGet : function(route, handler, scope) {
      return this.__messaging.on("get", route, handler, scope);
    },


    /**
     * This is a shorthand for {@link #onGet}.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches.
     * @param handler {Function} The handler to call, when the route matches with the executed path.
     * @param scope {Object} The scope of the handler.
     */
    on : function(route, handler, scope) {
      return this.onGet(route, handler, scope);
    },


    /**
     * Adds a route handler for the "post" operation. The route gets called
     * when the {@link #executePost} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches.
     * @param handler {Function} The handler to call, when the route matches with the executed path.
     * @param scope {Object} The scope of the handler.
     */
    onPost : function(route, handler, scope) {
      return this.__messaging.on("post", route, handler, scope);
    },


    /**
     * Adds a route handler for the "put" operation. The route gets called
     * when the {@link #executePut} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onPut : function(route, handler, scope) {
      return this.__messaging.on("put", route, handler, scope);
    },


    /**
     * Adds a route handler for the "delete" operation. The route gets called
     * when the {@link #executeDelete} method found a match.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onDelete : function(route, handler, scope) {
      return this.__messaging.on("delete", route, handler, scope);
    },


    /**
     * Adds a route handler for the "any" operation. The "any" operation is called
     * before all other operations.
     *
     * @param route {String|RegExp} The route, used for checking if the executed path matches
     * @param handler {Function} The handler to call, when the route matches with the executed path
     * @param scope {Object} The scope of the handler
     */
    onAny : function(route, handler, scope) {
      return this.__messaging.onAny(route, handler, scope);
    },


    /**
     * Removes a registered route by the given id.
     *
     * @param id {String} The id of the registered route
     */
    remove : function(id) {
      this.__messaging.remove(id);
    },


    /**
     * Hash change event handler.
     *
     * @param evt {qx.event.type.Data} The changeHash event.
     */
    __onChangeHash : function(evt)
    {
      var path = evt.getData();
      if (path == "" || path == null){
        path = qx.application.Routing.DEFAULT_PATH;
      }

      if (path != this.__currentGetPath) {
        this._executeGet(path, null, true);
      }
    },


    /**
     * Executes the get operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param customData {var} The given custom data that should be propagated
     * @param fromEvent {var} Determines whether this method was called from history
     *
     */
    _executeGet : function(path, customData, fromEvent) {
      this.__currentGetPath = path;

      var history = this.__getFromHistory(path);
      if (history)
      {
        if (!customData)
        {
          customData = history.data.customData || {};
          customData.fromHistory = true;
          customData.action = history.action;
          customData.fromEvent = fromEvent;
        }
      } else {
        this.__addToHistory(path, customData);
        this.__forward = [];
      }

      this.__navigationHandler.setState(path);
      this.__messaging.emit("get", path, null, customData);
    },


    /**
     * Executes the get operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param customData {var} The given custom data that should be propagated
     */
    executeGet : function(path, customData) {
      this._executeGet(path, customData);
    },


    /**
     * This is a shorthand for {@link #executeGet}.
     *
     * @param path {String} The path to execute
     * @param customData {var} The given custom data that should be propagated
     */
    execute : function(path, customData) {
      this.executeGet(path, customData);
    },


    /**
     * Executes the post operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    executePost : function(path, params, customData) {
      this.__messaging.emit("post", path, params, customData);
    },


    /**
     * Executes the put operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    executePut : function(path, params, customData) {
      this.__messaging.emit("put", path, params, customData);
    },


    /**
     * Executes the delete operation and informs all matching route handler.
     *
     * @param path {String} The path to execute
     * @param params {Map} The given parameters that should be propagated
     * @param customData {var} The given custom data that should be propagated
     */
    executeDelete : function(path, params, customData) {
      this.__messaging.emit("delete", path, params, customData);
    },


    /**
     * Adds the custom data of a given path to the history.
     *
     * @param path {String} The path to store.
     * @param customData {var} The custom data to store
     */
    __addToHistory : function(path, customData)
    {
      this.__back.unshift({
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
      var back = this.__back;
      var forward = this.__forward;
      var found = false;

      var entry = null;
      var length = back.length;
      for (var i = 0; i < length; i++)
      {
        if (back[i].path == path)
        {
          entry = back[i];
          var toForward = back.splice(0,i);
          for (var a=0; a<toForward.length; a++){
            forward.unshift(toForward[a]);
          }
          found = true;
          break;
        }
      }
      if (found){
        return {
          data : entry,
          action : "back"
        }
      }

      var length = forward.length;
      for (var i = 0; i < length; i++)
      {
        if (forward[i].path == path)
        {
          entry = forward[i];
          var toBack = forward.splice(0,i+1);
          for (var a=0; a<toBack.length; a++){
            back.unshift(toBack[a]);
          }
          break;
        }
      }

      if (entry){
        return {
          data : entry,
          action : "forward"
        }
      }
      return entry;
    },


    /**
     * Decouples the Routing from the navigation handler.
     */
    dispose : function() {
      this.__navigationHandler.removeListener("changeState", this.__onChangeHash, this);
    }
  }
});
