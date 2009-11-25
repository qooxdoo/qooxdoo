/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This store is respoinsible for loading data using JSON-P
 * (http://ajaxian.com/archives/jsonp-json-with-padding).
 * All the callback handling is handled by the store itself. The only thing
 * which the store needs to know is the name of the parameter, with which he
 * could specify the name of the callback function.
 */
qx.Class.define("qx.data.store.Jsonp",
{
  extend : qx.data.store.Json,

  /**
   * @param url {String?} URL of the web service.
   * @param delegate {Object?} The delegate containing one of the methods
   *   specified in {@link qx.data.store.IStoreDelegate}.
   * @param callbackParam {String} The name of the callback param for JSON-P
   */
  construct : function(url, delegate, callbackParam) {
    if (callbackParam != undefined) {
      this.setCallbackParam(callbackParam);
    }
    this.base(arguments, url, delegate);
  },


  properties : {
    /**
     * The name of the callback parameter of the service.
     */
    callbackParam : {
      check : "String",
      nullable : false
    }
  },


  members :
  {
    // overridden
    _createRequest: function(url) {
      var loader = new qx.io2.ScriptLoader();

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(loader);
      }

      var prefix = url.indexOf("?") == -1 ? "?" : "&";
      url += prefix + this.getCallbackParam() + "=";
      var id = parseInt(this.toHashCode(), 36);

      qx.data.store.Jsonp[id] = this;
      url += 'qx.data.store.Jsonp[' + id + '].callback';
      loader.load(url, function(data) {
        delete this[id];
      }, this);
    },


    /**
     * The used callback for the JSON-P.
     *
     * @param data {Object} The returned JSON data.
     * @internal
     */
    callback : function(data) {
      this.__loaded(data);
    },


    /**
     * Handles the completeion of the request and the building of the model.
     *
     * @param data {Object} The JSON data from the request.
     */
    __loaded: function(data) {
      if (data == undefined) {
        this.setState("failed");
        return;
      }

      // check for the data manipulation hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.manipulateData)) {
        data = this._delegate.manipulateData(data);
      }

      // create the class
      this._marshaler.toClass(data);
      // set the initial data
      this.setModel(this._marshaler.toModel(data));

      // fire complete event
      this.fireDataEvent("loaded", this.getModel());
    }
  }
});