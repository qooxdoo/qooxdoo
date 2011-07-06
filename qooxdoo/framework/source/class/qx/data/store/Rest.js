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
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.data.store.Rest",
{
  extend: qx.core.Object,

  /**
   * @param delegate {Object?null} The delegate containing one of the methods
   *  specified in {@link qx.data.store.IStoreDelegate}.
   */
  construct: function(resource, actionName, delegate)
  {
    this.base(arguments);
    this.setResource(resource);
    this.setActionName(actionName);

    this._delegate = delegate;
    this._marshaler = new qx.data.marshal.Json(delegate);

    if (delegate && qx.lang.Type.isFunction(delegate.configureRequest)) {
      this.__configureRequest();
    }

    this.__onActionSuccessBound = qx.lang.Function.bind(this.__onActionSuccess, this);
    this.__addListeners();
  },

  properties:
  {
    resource: {
      check: "qx.io.rest.Resource"
    },

    actionName: {
      check: "String"
    },

    model: {
      nullable: true,
      event: "changeModel"
    }
  },

  members:
  {
    _marshaler: null,
    _delegate: null,

    __onActionSuccessBound: null,

    __configureRequest: function() {
      var resource = this.getResource(),
          delegate = this._delegate;

      // Overrides existing callback, if any
      resource.configureRequest(delegate.configureRequest);
    },

    __addListeners: function() {
      var resource = this.getResource(),
          actionName = this.getActionName();

      if (resource && actionName) {
        resource.addListener(this.getActionName() + "Success", this.__onActionSuccessBound);
      }
    },

    __onActionSuccess: function(e) {
      var data = e.getData(),
          marshaler = this._marshaler,
          oldModel = this.getModel(),
          delegate = this._delegate,
          model;

      // Skip if data is empty
      if (data) {

        // Manipulate received data
        if (delegate && delegate.manipulateData) {
          data = delegate.manipulateData(data);
        }

        // Create class suiting data and assign instance
        // initialized with data to model property
        marshaler.toClass(data, true);
        model = marshaler.toModel(data);
        if (model) {
          this.setModel(model);
        }
      }

      // Dispose instance marshaled before
      if (oldModel && oldModel.dispose) {
        oldModel.dispose();
      }
    }
  },

  destruct: function() {
    this._marshaler && this._marshaler.dispose();
  }
});
