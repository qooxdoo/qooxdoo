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
   * @param delegate {Object?null} The delegate containing one of the methods
   *   specified in {@link qx.data.store.IStoreDelegate}.
   * @param callbackParam {String} The name of the callback param for JSON-P.
   *   This is *not* the name of a static function. It is the name of the URL
   *   parameter where the server expects the name of the statif cuntion used
   *   in JSON-P. Its something given by the service you use. In this examle:
   *   <code>http://twitter.com/statuses/friends_timeline.json?callback=methodName</code>
   *   the parameter should be <code>callback</code>.
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
    __loader : null,


    // overridden
    _createRequest: function(url) {
      // if there is an old loader, dispose it
      if (this.__loader) {
        this.__loader.dispose();
      }
      this.__loader = new qx.io.ScriptLoader();

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(this.__loader);
      }

      var prefix = url.indexOf("?") == -1 ? "?" : "&";
      url += prefix + this.getCallbackParam() + "=";
      var id = parseInt(this.toHashCode(), 10);

      qx.data.store.Jsonp[id] = this;
      url += 'qx.data.store.Jsonp[' + id + '].callback';
      this.__loader.load(url, function(status) {
        delete this[id];
        if (status === "fail") {
          this.fireEvent("error");
        }
      }, this);
    },


    /**
     * The used callback for the JSON-P.
     *
     * @param data {Object} The returned JSON data.
     * @internal
     */
    callback : function(data) {
      // check for disposed callback calls
      if (this.isDisposed()) {
        return;
      }
      this.__loaded(data);
    },


    /**
     * Handles the completion of the request and the building of the model.
     *
     * @param data {Object} The JSON data from the request.
     */
    __loaded: function(data) {
      if (data == undefined) {
        this.setState("failed");
        this.fireEvent("error");
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
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__loader) {
      this.__loader.dispose();
    }
    this.__loader = null;
  }
});
