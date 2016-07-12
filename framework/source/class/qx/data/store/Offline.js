/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tobias Oberrauch (toberrauch)

************************************************************************ */
/**
 * This store is a read / write store for local or session storage.
 * It can be used like any other store by setting and manipulating the model
 * property or the model itself. Please keep in mind that if you want to have
 * the update functionality, you have to use a model which supports the
 * {@link qx.data.marshal.MEventBubbling#changeBubble} event.
 */
qx.Class.define("qx.data.store.Offline",
{
  extend : qx.core.Object,


  /**
   * @param key {String} A unique key which is used to store the data.
   * @param storage {String?} Either "local" or "session" to determinate which
   *   storage should be used. Default: "local"
   * @param delegate {Object} An object containing one of the methods described
   *   in {@link qx.data.marshal.IMarshalerDelegate}.
   */
  construct : function(key, storage, delegate)
  {
    this.base(arguments);

    try {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertNotUndefined(key);
      }
    } catch(e) {
      this.dispose();
      throw e;
    }

    if (storage == "session") {
      this._storage = qx.bom.Storage.getSession();
    } else {
      this._storage = qx.bom.Storage.getLocal();
    }

    this._storeModel = qx.util.Function.debounce(
      this.__storeModel.bind(this),
      qx.data.store.Offline.STORE_MODEL_DELAY
    );

    this._marshaler = new qx.data.marshal.Json(delegate);
    this._key = key;

    this._initializeModel();
  },


  properties :
  {
    /**
     * Property for holding the loaded model instance. Please keep in mind to
     * use a model supporting the changeBubble event.
     */
    model : {
      nullable: true,
      event: "changeModel",
      apply: "_applyModel"
    }
  },

  statics: {
    /**
     * Defines the delay between the requested and actual execution of the setItem method
     */
    STORE_MODEL_DELAY: 400
  },

  members :
  {
    _storage : null,

    __modelListenerId : null,

    /**
     * The actual method that will called after a delay of STORE_MODEL_DELAY
     */
    __storeModel: function() {
      var value = qx.util.Serializer.toNativeObject(this.getModel());
      this._storage.setItem(this._key, value);
    },


    // property apply
    _applyModel : function(value, old) {
      // take care of the old stuff.
      if (old) {
        old.removeListenerById(this.__modelListenerId);
        old.dispose();
        this.__modelListenerId = null;
      }

      if (value) {
        this.__modelListenerId = value.addListener(
          "changeBubble", this._storeModel, this
        );
        this._storeModel();
      } else {
        this._storage.removeItem(this._key);
      }
    },


    /**
     * Helper for writing the set model to the browser storage.
     *
     * @signature function()
     */
    _storeModel : null,


    /**
     * Helper for reading the model from the browser storage.
     */
    _initializeModel : function() {
      this._setModel(this._storage.getItem(this._key));
    },


    /**
     * Responsible for creating the model read from the browser storage.
     * @param data {var} The data read from the storage.
     */
    _setModel : function(data) {
      this._marshaler.toClass(data, true);

      // Dispose previous
      if (this.getModel()) {
        this.getModel().dispose();
      }

      var model = this._marshaler.toModel(data, true);
      if (model === undefined) {
        model = null;
      }
      this.setModel(model);
    },


    /**
     * Accessor for the unique key used to store the data.
     * @return {String} The key.
     */
    getKey : function() {
      return this._key;
    }
  },

  destruct : function() {
    if (this.getModel()) {
      this.getModel().dispose();
    }

    if (this._marshaler) {
      this._marshaler.dispose();
    }
  }
});
