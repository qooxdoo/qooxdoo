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
     * John Spackman (john.spackman@zenesis.com

************************************************************************ */

/**
 * ArrayMirror Controller
 * 
 * Manages a mirror set of objects, binding properties from the model to the target.
 * This is useful for EG mirroring a data model into an array of ListItems and
 * binding various properties such as item caption etc (see qx.data.controller.List2)
 * 
 * Although the reference usage of this is List2, this class has no dependency on
 * any qx.ui component - it's job is to map properties between arrays of qx.core.Object's
 * only.
 * 
 */
qx.Class.define("qx.data.controller.ArrayMirror", {
  extend: qx.core.Object,
  
  construct: function(delegate) {
    this.base(arguments);
    this.__bindPaths = [];
    this.__modelItemInfos = {};
    if (delegate)
      this.setDelegate(delegate);
  },
  
  properties: {
    /** The array to watch */
    model: {
      init: null,
      nullable: true,
      check: "qx.data.Array",
      apply: "_applyModel",
      event: "changeModel"
    },
    
    /** The array that is to be a mirror of model */
    target: {
      init: null,
      nullable: true,
      check: "qx.data.Array",
      apply: "_applyTarget",
      event: "changeTarget"
    },

    /** Allows delegating functions to the caller */ 
    delegate: {
      init: null,
      nullable: true,
      //check: "qx.data.controller.IArrayDelegate",
      event: "changeDelegate"
    }
  },
  
  members: {
    __bindPaths: null,
    __modelItemInfos: null,
    __loading: false,
    
    /**
     * Adds a binding between items in the model array and the corresponding object
     * in the target array.  If the model is non-empty then this will add the binding 
     * to existing model items.
     * 
     * @param fromPath {String} the path to a property in a model item
     * @param toPath {String} the path to a property in a target item
     * @param options {Object?} optional options to pass to {@link qx.data.SingleValueBinding#bind}
     */
    bindChild: function(fromPath, toPath, options) {
      var t = this;
      var bindPath = { 
          fromPath: fromPath, 
          toPath: toPath, 
          options: options 
      };
      var index = this.__bindPaths.length;
      this.__bindPaths.push(bindPath);
      var model = this.getModel();
      var target = this.getTarget();
      if (model && target) {
        model.forEach(function(modelItem) {
          var modelItemInfo = t.__modelItemInfos[modelItem.toHashCode()];
          t._attachBindPath(modelItemInfo, index);
        });
      }
    },
    
    /**
     * Removes property binding from the model array; if the model array is non empty, then the
     * binding is removed but the value is not reset in the target item
     * 
     * @param fromPath {String} the path to a property in a model item
     * @param toPath {String} the path to a property in a target item
     */
    unbindChild: function(fromPath, toPath) {
      var t = this;
      
      for (var i = 0; i < this.__bindPaths.length; i++) {
        var bindPath = this.__bindPaths[i];
        if (bindPath.fromPath == fromPath && bindPath.toPath == toPath) {
          qx.lang.Array.removeAt(t.__bindPaths, i);
          Object.keys(t.__modelItemInfos).forEach(function(hash) {
            var modelItemInfo = t.__modelItemInfos[hash];
            modelItemInfo.pathInfos.forEach(function(pathInfo, index) {
              if (pathInfo.bindPath === bindPath) {
                t._detachBindPath(modelItemInfo, index);
              }
            });
          });
          return;
        }
      }
    },
    
    /**
     * Apply for model property
     */
    _applyModel: function(value, oldValue) {
      if (oldValue) {
        oldValue.removeListener("change", this.__onChangeModel, this);
      }
      if (value) {
        value.addListener("change", this.__onChangeModel, this);
      }
      
      this.reload();
    },
    
    /**
     * Apply for target property
     */
    _applyTarget: function(value, oldValue) {
      this.reload();
    },
    
    /**
     * Event handler for changes to the model property
     */
    __onChangeModel: function(evt) {
      var t = this;
      var data = evt.getData();
      var target = this.getTarget();
      var model = this.getModel();
      
      if (data.removed) {
        data.removed.forEach(function(modelItem) {
          var modelItemInfo = t.__modelItemInfos[modelItem.toHashCode()];
          t._detach(modelItemInfo.modelItem);
        });
      }
      if (data.added) {
        data.added.forEach(function(modelItem) {
          var targetItem = t._createTargetItem();
          t._attach(modelItem, targetItem);
          var index = model.indexOf(modelItem);
          target.insertAt(index, targetItem);
        });
      }
      if (data.type == "order") {
        var args = [ 0, target.getLength() ];
        this.getModel().forEach(function(modelItem) {
          var modelItemInfo = t.__modelItemInfos[modelItem.toHashCode()];
          args.push(modelItemInfo.targetItem);
        });
        target.splice.apply(target, args);
      }
    },
    
    /**
     * Causes the target array to be emptied and reloaded from scratch
     */
    reload: function() {
      var t = this;
      this.__loading = true;
      try {
        Object.keys(this.__modelItemInfos).forEach(function(hash) {
          var modelItemInfo = t.__modelItemInfos[hash];
          t._detach(modelItemInfo.modelItem);
        });
        var model = this.getModel();
        var target = this.getTarget();
        if (!model || !target)
          return;
        model.forEach(function(modelItem) {
          var targetItem = t._createTargetItem();
          t._attach(modelItem, targetItem);
          target.push(targetItem);
        });
      } finally {
        this.__loading = false;
      }
    },
    
    /**
     * Attaches a model item to a target item, creating bindings etc.  
     * See also {@link #_detach}
     * 
     * @param modelItem {qx.core.Object} the model item to attach
     * @param targetItem {qx.core.Object} the target item to attach
     * @returns
     */
    _attach: function(modelItem, targetItem) {
      var t = this;
      var modelItemInfo = this.__modelItemInfos[modelItem.toHashCode()] = {
          pathInfos: [],
          targetItem: targetItem,
          modelItem: modelItem
      };
      this.__bindPaths.forEach(function(bindPath, index) {
        t._attachBindPath(modelItemInfo, index);
      });
      this._bindTargetItem(targetItem, modelItem);
    },
    
    /**
     * Helper method that adds a binding for a particular bind path (@see #bindChild)
     * 
     * @param modelItemInfo {Object} from __modelItemInfos
     * @param index {Integer} array index of this.__bindPaths
     */
    _attachBindPath: function(modelItemInfo, index) {
      var bindPath = this.__bindPaths[index]; 
      var pathInfo = modelItemInfo.pathInfos[index] = {};
      pathInfo.bindPath = bindPath;
      if (bindPath.fromPath == "") {
        qx.util.PropertyPath.setValue(modelItemInfo.targetItem, bindPath.toPath, modelItemInfo.modelItem);
      } else {
        pathInfo.listenerId = modelItemInfo.modelItem.bind(bindPath.fromPath, modelItemInfo.targetItem, bindPath.toPath, bindPath.options);
      }
    },
    
    /**
     * Detaches a model item, inverse of {@link #_attach}
     * @param modelItem {qx.core.Object} the model item to detach from
     * @param removeFromTarget {Boolean?} whether to remove the target from the target array (default is true)
     * @return {Object} the modelItemInfo
     */
    _detach: function(modelItem, removeFromTarget) {
      var t = this;
      var modelItemInfo = this.__modelItemInfos[modelItem.toHashCode()];
      delete this.__modelItemInfos[modelItem.toHashCode()];
      modelItemInfo.pathInfos.forEach(function(pathInfo, index) {
        t._detachBindPath(modelItemInfo, index);
      });
      var targetItem = modelItemInfo.targetItem;
      this._unbindTargetItem(targetItem);
      if (removeFromTarget !== false)
        this.getTarget().remove(targetItem);
      this._disposeTargetItem(targetItem);
      return modelItemInfo;
    },
    
    /**
     * Helper method that removes a binding for a particular bind path (@see #bindChild)
     * 
     * @param modelItemInfo {Object} from __modelItemInfos
     * @param index {Integer} array index of this.__bindPaths
     */
    _detachBindPath: function(modelItemInfo, index) {
      var pathInfo = modelItemInfo.pathInfos[index];
      if (pathInfo.bindPath.fromPath == "") {
        var bindPath = this.__bindPaths[index];
        qx.util.PropertyPath.setValue(modelItemInfo.targetItem, bindPath.toPath, null);
      } else {
        modelItemInfo.modelItem.removeBinding(pathInfo.listenerId);
        delete pathInfo.listenerId;
      }
      qx.lang.Array.removeAt(modelItemInfo.pathInfos, index);
    },
    
    /**
     * Creates an item for the target array; can be overridden, the default implementation
     * defers to the delegate
     */
    _createTargetItem: function() {
      var delegate = this.getDelegate();
      if (!delegate || typeof delegate.createTargetItem != "function")
        throw new Error("Cannot create a new item for " + this.classname + " because there is no delegate");
      return delegate.createTargetItem();
    },
    
    /**
     * Binds a target item to a model item; can be overridden, the default implementation
     * defers to the delegate.  Inverse of {@link #_unbindTargetItem}
     */
    _bindTargetItem: function(targetItem, modelItem) {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.bindTargetItem == "function")
        delegate.bindTargetItem(targetItem, modelItem);
    },
    
    /**
     * Unbinds a target item to a model item; can be overridden, the default implementation
     * defers to the delegate.  Inverse of {@link #_bindTargetItem}
     */
    _unbindTargetItem: function(targetItem, modelItem) {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.unbindTargetItem == "function")
        delegate.unbindTargetItem(targetItem, modelItem);
    },
    
    /**
     * Disposes a target item that is not longer needed; can be overridden, the default implementation
     * defers to the delegate
     */
    _disposeTargetItem: function(targetItem) {
      var delegate = this.getDelegate();
      if (delegate && typeof delegate.disposeTargetItem == "function")
        delegate.disposeTargetItem(targetItem);
      else
        targetItem.dispose();
    }
  }
});