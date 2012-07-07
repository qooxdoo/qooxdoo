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
     * Martin Wittemann (martinwittemann)

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
   */
  construct : function(key, storage)
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

    this._marshaler = new qx.data.marshal.Json();
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


  members :
  {
    _storage : null,
    __modelListenerId : null,


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
          "changeBubble", this.__storeModel, this
        );
        this.__storeModel();
      } else {
        this._storage.removeItem(this._key);
      }
    },


    /**
     * Internal helper for writing the set model to the browser storage.
     */
    __storeModel : function() {
      var value = qx.util.Serializer.toNativeObject(this.getModel());
      this._storage.setItem(this._key, value);
    },


    /**
     * Helper for reading the model from the browser storage.
     */
    _initializeModel : function() {
      this._setModel(this._storage.getItem(this._key));
    },


    /**
     * Responsible for creating the model read from the brwoser storage.
     * @param data {var} The data read from the storage.
     */
    _setModel : function(data) {
      this._marshaler.toClass(data, true);

      // Dispose previous
      if (this.getModel()) {
        this.getModel().dispose();
      }

      this.setModel(this._marshaler.toModel(data, true));
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