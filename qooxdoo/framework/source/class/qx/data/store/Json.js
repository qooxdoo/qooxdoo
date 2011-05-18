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
 * The json data store is responsible for fetching data from an url. The type
 * of the data has to be json.
 *
 * The loaded data will be parsed and saved in qooxdoo objects. Every value
 * of the loaded data will be stored in a qooxdoo property. The model classes
 * for the data will be created automatically.
 *
 * For the fetching itself it uses the {@link qx.io.request.Xhr} class and
 * for parsing the loaded javascript objects into qooxdoo objects, the
 * {@link qx.data.marshal.Json} class will be used.
 *
 * Up to qooxdoo 1.4 {@link qx.io.remote.Request} was used as the transport. For
 * backwards-compatibility, qooxdoo 1.5 can be configured to use the old
 * transport with {@link #setDeprecatedTransport}.
 *
 * Please note that if you
 *
 * * upgrade from qooxdoo 1.4 or lower
 * * choose not to force the old transport
 * * use a delegate with qx.data.store.IStoreDelegate#configureRequest
 *
 * you probably need to change the implementation of your delegate to configure
 * the {@link qx.io.request.Xhr} request.
 *
 */
qx.Class.define("qx.data.store.Json",
{
  extend : qx.core.Object,


  /**
   * @param url {String|null} The url where to find the data. The store starts
   *   loading as soon as the URL is give. If you want to change some details
   *   concerning the request, add null here and set the URL as soon as
   *   everything is set up.
   * @param delegate {Object?null} The delegate containing one of the methods
   *   specified in {@link qx.data.store.IStoreDelegate}.
   */
  construct : function(url, delegate)
  {
    this.base(arguments);


    // store the marshaler and the delegate
    this._marshaler = new qx.data.marshal.Json(delegate);
    this._delegate = delegate;

    // use new transport by default
    this.__deprecatedTransport = false;

    this.__changePhaseHandlerBound = qx.lang.Function.bind(this.__changePhaseHandler, this);

    if (url != null) {
      this.setUrl(url);
    }
  },


  events :
  {
    /**
     * Data event fired after the model has been created. The data will be the
     * created model.
     */
    "loaded" : "qx.event.type.Data",

    /**
     * Fired when an error (aborted, timeout or failed) occurred
     * during the load. The data contains the respons of the request.
     * If you want more details, use the {@link #changeState} event.
     */
    "error" : "qx.event.type.Data"
  },


  properties :
  {
    /**
     * Property for holding the loaded model instance.
     */
    model : {
      nullable: true,
      event: "changeModel"
    },


    /**
     * The state of the request as an url. If you want to check if the request
     * did it’s job, use, the {@link #changeState} event and check for one of the
     * listed values.
     */
    state : {
      check : [
        "configured", "queued", "sending", "receiving",
        "completed", "aborted", "timeout", "failed"
      ],
      init : "configured",
      event : "changeState"
    },


    /**
     * The url where the request should go to.
     */
    url : {
      check: "String",
      apply: "_applyUrl",
      event: "changeUrl",
      nullable: true
    }
  },


  members :
  {
    _delegate : null,

    __request : null,
    __deprecatedTransport : null,
    __changePhaseHandlerBound : null,

    // apply function
    _applyUrl: function(value, old) {
      if (value != null) {
        // take care of the resource management
        value = qx.util.AliasManager.getInstance().resolve(value);
        value = qx.util.ResourceManager.getInstance().toUri(value);

        this._createRequest(value);
      }
    },


    /**
     * Set whether to use the old transport layer.
     *
     * @param value {Boolean} Whether to use the old transport layer.
     *
     * @deprecated In a future release, this setter will be removed and
     * the new transport used by default.
     */
    setDeprecatedTransport: function(value) {
      qx.core.Assert.assertBoolean(value);

      if (value) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      }

      this.__deprecatedTransport = value;
    },


    /**
     * Get whether to use the old transport layer.
     *
     * @return {Boolean} Whether to use the old transport layer.
     *
     * @deprecated In a future release, this getter will be removed and
     * the new transport used by default.
     */
    isDeprecatedTransport: function() {
      return !!this.__deprecatedTransport;
    },


    /**
     * Creates and sends a GET request with the given url.
     *
     * Listeners will be added to respond to the request’s "success",
     * "changePhase" and "fail" event.
     *
     * @param url {String} The url for the request.
     */
    _createRequest: function(url) {
      if (this.isDeprecatedTransport()) {
        this.__warnDeprecated();
        return this.__createRequestLegacy(url);
      }

      var req = this.__request = new qx.io.request.Xhr(url);

      // request json representation
      req.setAccept("application/json");

      // parse as json no matter what content type is returned
      req.setParser("json");

      // register the internal event before the user has the change to
      // register its own event in the delegate
      req.addListener("success", this.__requestCompleteHandler, this);

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(req);
      }

      // map request phase to it’s own phase
      req.addListener("changePhase", this.__changePhaseHandlerBound);

      // add failed, aborted and timeout listeners
      req.addListener("fail", this.__requestUnsuccessfulHandler, this);

      req.send();
    },

    /**
     * Creates and configures an instance of {@link qx.io.remote.Request}.
     *
     * @param url {String} The url for the request.
     *
     * @deprecated since 1.5
     */
    __createRequestLegacy: function(url) {
      // create the request
      this.__request = new qx.io.remote.Request(url, "GET", "application/json");

      // register the internal even before the user has the change to
      // register its own event in the delegate
      this.__request.addListener("completed", this.__requestCompleteHandlerLegacy, this);

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(this.__request);
      }

      // map the state to its own state
      this.__request.addListener("changeState", function(ev) {
        var state = ev.getData();
        this.setState(state);
      }, this);

      // add failed, aborted and timeout listeners
      this.__request.addListener("failed", this.__requestUnsuccessfulHandlerLegacy, this);
      this.__request.addListener("aborted", this.__requestUnsuccessfulHandlerLegacy, this);
      this.__request.addListener("timeout", this.__requestUnsuccessfulHandlerLegacy, this);

      this.__request.send();
    },


    /**
     * Handler called when request phase changes.
     *
     * Sets the store’s state.
     *
     * @param ev {qx.event.type.Data} The request’s changePhase event.
     */
    __changePhaseHandler : function(ev) {
      var requestPhase = ev.getData(),
          requestPhaseToStorePhase = {},
          state;

      requestPhaseToStorePhase = {
        "opened": "configured",
        "sent": "sending",
        "loading": "receiving",
        "success": "completed",
        "abort": "aborted",
        "timeout": "timeout",
        "statusError": "failed"
      };

      state = requestPhaseToStorePhase[requestPhase];
      if (state) {
        this.setState(state);
      }
    },


    /**
     * Handler called when not completing the request successfully.
     *
     * @param ev {qx.event.type.Event} The request’s fail event.
     */
    __requestUnsuccessfulHandler : function(ev) {
      var req = ev.getTarget();
      this.fireDataEvent("error", req);
    },

    /**
     * Handler called when not completing the legacy request successfully.
     *
     * @param ev {qx.io.remote.Response} The response object of the request.
     *
     * @deprecated since 1.5
     */
    __requestUnsuccessfulHandlerLegacy : function(ev) {
      this.fireDataEvent("error", ev);
    },


    /**
     * Handler for the completion of the requests. It invokes the creation of
     * the needed classes and instances for the fetched data using
     * {@link qx.data.marshal.Json}.
     *
     * @param ev {qx.event.type.Event} The request’s success event.
     */
    __requestCompleteHandler : function(ev)
    {
       var req = ev.getTarget(),
           data = req.getResponse();

       // check for the data manipulation hook
       var del = this._delegate;
       if (del && qx.lang.Type.isFunction(del.manipulateData)) {
         data = this._delegate.manipulateData(data);
       }

       // create the class
       this._marshaler.toClass(data, true);

       var oldModel = this.getModel();

       // set the initial data
       this.setModel(this._marshaler.toModel(data));

       // get rid of the old model
       if (oldModel && oldModel.dispose) {
         oldModel.dispose();
       }

       // fire complete event
       this.fireDataEvent("loaded", this.getModel());
    },

    /**
     * Handler for the completion of legacy requests.
     *
     * @param ev {qx.io.remote.Response} The event fired by the request.
     */
    __requestCompleteHandlerLegacy : function(ev)
    {
       var data = ev.getContent();

       // check for the data manipulation hook
       var del = this._delegate;
       if (del && qx.lang.Type.isFunction(del.manipulateData)) {
         data = this._delegate.manipulateData(data);
       }

       // create the class
       this._marshaler.toClass(data, true);

       var oldModel = this.getModel();

       // set the initial data
       this.setModel(this._marshaler.toModel(data));

       // get rid of the old model
       if (oldModel && oldModel.dispose) {
         oldModel.dispose();
       }

       // fire complete event
       this.fireDataEvent("loaded", this.getModel());
    },


    /**
     * Reloads the data with the url set in the {@link #url} property.
     */
    reload: function() {
      var url = this.getUrl();
      if (url != null) {
        this._createRequest(url);
      }
    },

    /**
     * Warn about deprecated usage.
     */
    __warnDeprecated: function() {
      qx.log.Logger.warn("Using qx.io.remote.Request in qx.data.store.Json " +
        "is deprecated. Please consult the API documentation.");
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("_marshaler", "__request");
    this._delegate = null;
  }
});
