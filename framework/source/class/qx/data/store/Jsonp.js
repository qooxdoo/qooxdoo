/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 *
 * The JSONP data store is a specialization of {@link qx.data.store.Json}. It
 * differs in the type of transport used ({@link qx.io.request.Jsonp}). In
 * order to fulfill requirements of the JSONP service, the method
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
    }
  }
});
