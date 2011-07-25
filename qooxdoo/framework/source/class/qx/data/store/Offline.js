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
qx.Class.define("qx.data.store.Offline", 
{
  extend : qx.core.Object,


  construct : function(key, storage)
  {
    this.base(arguments);

    if (storage == "local") {
      this._storage = qx.bom.storage.Local.getInstance();
    } else {
      this._storage = qx.bom.storage.Session.getInstance();
    }

    this._marshaler = new qx.data.marshal.Json();
    this._key = key;

    this._initializeModel();
  },

  properties : 
  {
    /**
     * Property for holding the loaded model instance.
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


    _applyModel : function(value, old) {
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
      }
    },

    __storeModel : function() {
      var value = qx.util.Serializer.toNativeObject(this.getModel());
      this._storage.setItem(this._key, value);
    },


    _initializeModel : function() {
      this._setModel(this._storage.getItem(this._key));
    },


    _setModel : function(data) {
      this._marshaler.toClass(data, true);
      this.setModel(this._marshaler.toModel(data, true));
    }
  }
});