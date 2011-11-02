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
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 *
 * The JSONP data store is a specialization of {@link qx.data.store.Json}. It
 * differs in the type of transport used ({@link qx.io.request.Jsonp}). In
 * order to fullfill requirements of the JSONP service, the method
 * {@link #setCallbackParam} can be used.
 *
 * Please note that the upgrade notices described in {@link qx.data.store.Json}
 * also apply to this class.
 *
 */
qx.Class.define("qx.data.store.Jsonp",
{
  extend : qx.data.store.Json,

  /**
   * @param url {String?} URL of the JSONP service.
   * @param delegate {Object?null} The delegate containing one of the methods
   *   specified in {@link qx.data.store.IStoreDelegate}.
   * @param callbackParam {String?} The name of the callback param. See
   *   {@link qx.bom.request.Jsonp#setCallbackParam} for more details.
   */
  construct : function(url, delegate, callbackParam) {
    if (callbackParam != undefined) {
      this.setCallbackParam(callbackParam);
    }

    this.base(arguments, url, delegate);
  },


  properties : {
    /**
     * The name of the callback parameter of the service. See
     * {@link qx.bom.request.Jsonp#setCallbackParam} for more details.
     */
    callbackParam : {
      check : "String",
      init : "callback",
      nullable : true
    },


    /**
    * The name of the callback function. See
    * {@link qx.bom.request.Jsonp#setCallbackName} for more details.
    *
    * Note: Ignored when legacy transport is used.
    */
    callbackName : {
      check : "String",
      nullable : true
    }
  },


  members :
  {

    // overridden
    _createRequest: function(url) {
      if (this.isDeprecatedTransport()) {
        this._warnDeprecated();
        return this.__createRequestLoader(url);
      }

      // dispose old request
      if (this._getRequest()) {
        this._getRequest().dispose();
      }

      var req = new qx.io.request.Jsonp();
      this._setRequest(req);

      // default when null
      req.setCallbackParam(this.getCallbackParam());
      req.setCallbackName(this.getCallbackName());

      // send
      req.setUrl(url);

      // register the internal event before the user has the change to
      // register its own event in the delegate
      req.addListener("success", this._onSuccess, this);

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(req);
      }

      // map request phase to it’s own phase
      req.addListener("changePhase", this._onChangePhase, this);

      // add failed, aborted and timeout listeners
      req.addListener("fail", this._onFail, this);

      req.send();
    },

    /**
     * Creates and configures an instance of {@link qx.io.ScriptLoader}.
     *
     * @param url {String} The url for the request.
     *
     * @deprecated since 1.5
     */
    __createRequestLoader: function(url) {
      // if there is an old loader, dispose it
      if (this._getRequest()) {
        this._getRequest().dispose();
      }

      var req = new qx.io.ScriptLoader();
      this._setRequest(req);

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(req);
      }

      var prefix = url.indexOf("?") == -1 ? "?" : "&";
      url += prefix + this.getCallbackParam() + "=";
      var id = parseInt(this.toHashCode(), 10);

      qx.data.store.Jsonp[id] = this;
      url += 'qx.data.store.Jsonp[' + id + '].callback';
      req.load(url, function(status) {
        delete this[id];
        if (status === "fail") {
          this.fireDataEvent("error");
        }
      }, this);
    },


    /**
     * The used callback for the JSON-P.
     *
     * @param data {Object} The returned JSON data.
     * @internal
     *
     * @deprecated since 1.5
     *
     */
    callback : function(data) {
      // check for disposed callback calls
      if (this.isDisposed()) {
        return;
      }
      this.__loadedLoader(data);
    },


    /**
     * Handles the completion of the legacy request and the building of the model.
     *
     * @param data {Object} The JSON data from the request.
     *
     * @deprecated since 1.5
     */
    __loadedLoader: function(data) {
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
    },


    /**
     * Warn about deprecated usage.
     *
     * @deprecated since 1.5
     */
    _warnDeprecated: function() {
      qx.log.Logger.warn("Using qx.io.ScriptLoader in qx.data.store.Jsonp " +
        "is deprecated. Please consult the API documentation.");
    }
  }
});
