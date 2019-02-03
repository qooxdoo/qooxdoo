/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

/**
 * A mixin providing objects by ID and owners.
 * 
 * The typical use of IDs is to override the `_createQxObjectImpl` method and create
 * new instances on demand; all code should access these instances by calling
 * `getQxObject`.
 */
qx.Mixin.define("qx.core.MObjectId", {
  
  /*
   * ****************************************************************************
   * PROPERTIES
   * ****************************************************************************
   */

  properties: {

    /** The owning object */
    qxOwner : {
      init : null,
      check : "qx.core.Object",
      nullable : true,
      apply : "_applyQxOwner"
    },


    /** {String} The ID of the object.  */
    qxObjectId : {
      init: null,
      check : function(value) { return value === null || (typeof value == "string" && value.indexOf('/') < 0); },
      nullable : true,
      apply : "_applyQxObjectId"
    }
  },

  /*
   * ****************************************************************************
   * MEMBERS
   * ****************************************************************************
   */

  members: {
    
    __ownedQxObjects: null,
    __changingQxOwner: false,

    /**
     * Apply owner
     */
    _applyQxOwner : function(value, oldValue) {
      if (!this.__changingQxOwner) {
        throw new Error("Please use API methods to change owner, not the property");
      }
    },
    
    /**
     * Apply objectId
     */
    _applyQxObjectId : function(value, oldValue) {
      if (!this.__changingQxOwner) {
        var owner = this.getQxOwner();
        if (owner) {
          owner.__onOwnedObjectIdChange(this, value, oldValue);
        }
        this._cascadeQxObjectIdChanges();
      }
    },
    
    /**
     * Called when a child's objectId changes
     */
    __onOwnedObjectIdChange: function(obj, newId, oldId) {
      delete this.__ownedQxObjects[oldId];
      this.__ownedQxObjects[newId] = obj;
    },
    
    /**
     * Reflect changes to IDs or owners
     */
    _cascadeQxObjectIdChanges: function() {
      if (typeof this.getContentElement == "function") {
        var contentElement = this.getContentElement();
        if (contentElement) {
          contentElement.updateObjectId();
        }
      }
      if (this.__ownedQxObjects) {
        for (var name in this.__ownedQxObjects) {
          this.__ownedQxObjects[name]._cascadeQxObjectIdChanges();
        }
      }
    },
    
    /**
     * Returns the object with the specified ID
     * 
     * @param id
     *          {String} ID of the object
     * @return {qx.core.Object?} the found object
     */
    getQxObject: function(id) {
      if (this.__ownedQxObjects) {
        var obj = this.__ownedQxObjects[id];
        if (obj !== undefined) {
          return obj;
        }
      }
      
      // Separate out the child control ID
      var controlId = null;
      var pos = id.indexOf('#');
      if (pos > -1) {
        controlId = id.substring(pos + 1);
        id = id.substring(0, pos);
      }
      
      var result = undefined;
      
      // Handle paths
      if (id.indexOf('/') > -1) {
        var segs = id.split('/');
        var target = this;
        var found = segs.every(function(seg) {
          if (!seg.length) {
            return true;
          }
          if (!target) {
            return false;
          }
          var tmp = target.getQxObject(seg);
          if (tmp !== undefined) {
            target = tmp;
            return true;
          }
        });
        if (found) {
          result = target;
        }
        
      } else {
        // No object, creating the object
        result = this._createQxObject(id);
      }
      
      if (result && controlId) {
        var childControl = result.getChildControl(controlId);
        return childControl;
      }
      
      return result;
    },
    
    /**
     * Creates the object and adds it to a list; most classes are expected to
     * override `_createQxObjectImpl` NOT this method.
     * 
     * @param id {String} ID of the object
     * @return {qx.core.Object?} the created object
     */
    _createQxObject: function(id) {
      var result = this._createQxObjectImpl(id);
      if (result !== undefined) {
        this.addOwnedQxObject(result, id);
      }
      return result;
    },
    
    /**
     * Creates the object, intended to be overridden. Null is a valid return
     * value and will be cached by `getQxObject`, however `undefined` is NOT a
     * valid value and so will not be cached meaning that `_createQxObjectImpl`
     * will be called multiple times until a valid value is returned.
     * 
     * @param id {String} ID of the object
     * @return {qx.core.Object?} the created object
     */
    _createQxObjectImpl: function(id) {
      return undefined;
    },
    
    /**
     * Adds an object as owned by this object
     * 
     * @param obj {qx.core.Object} the object to register
     * @param id {String?} the id to set when registering the object
     */
    addOwnedQxObject: function(obj, id) {
      if (!this.__ownedQxObjects) {
        this.__ownedQxObjects = {};
      }
      var thatOwner = obj.getQxOwner();
      if (thatOwner === this) {
        return;
      }
      obj.__changingQxOwner = true;
      try {
        if (thatOwner) {
          thatOwner.__removeOwnedQxObjectImpl(obj);
        }
        if (id === undefined) {
          id = obj.getQxObjectId();
        }
        if (!id) {
          throw new Error("Cannot register an object that has no ID, obj=" + obj);
        }
        if (this.__ownedQxObjects[id]) {
          throw new Error("Cannot register an object with ID '" + id + "' because that ID is already in use, this=" + this + ", obj=" + obj);
        }
        if (obj.getQxOwner() != null) {
          throw new Error("Cannot register an object with ID '" + id + "' because it is already owned by another object this=" + this + ", obj=" + obj);
        }
        obj.setQxOwner(this);
        obj.setQxObjectId(id);
        obj._cascadeQxObjectIdChanges();
      } finally {
        obj.__changingQxOwner = false;
      }
      this.__ownedQxObjects[id] = obj;
    },

    /**
     * Discards an object from the list of owned objects; note that this does
     * not dispose of the object, simply forgets it if it exists.
     * 
     * @param args {String|Object} the ID of the object to discard, or the object itself
     */
    removeOwnedQxObject: function(args) {
      if (!this.__ownedQxObjects) {
        throw new Error("Cannot discard object because it is not owned by this, this=" + this + ", object=" + obj);
      }
      
      var id;
      var obj;
      if (typeof args === "string") {
        if (args.indexOf('/') > -1) {
          throw new Error("Cannot discard owned objects based on a path");
        }
        id = args;
        obj = this.__ownedQxObjects[id];
        if (obj === undefined) {
          return;
        }
      } else {
        obj = args;
        id = obj.getQxObjectId();
        if (this.__ownedQxObjects[id] !== obj) {
          throw new Error("Cannot discard object because it is not owned by this, this=" + this + ", object=" + obj);
        }
      }

      if (obj !== null) {
        obj.__changingQxOwner = true;
        try {
          this.__removeOwnedQxObjectImpl(obj);
          obj._cascadeQxObjectIdChanges();
        } finally {
          obj.__changingQxOwner = false;
        }
      }
    },
    
    /**
     * Removes an owned object
     * 
     * @param obj {qx.core.Object} the object
     */
    __removeOwnedQxObjectImpl: function(obj) {
      if (obj !== null) {
        var id = obj.getQxObjectId();
        obj.setQxOwner(null);
        delete this.__ownedQxObjects[id];
      }
    },

    /**
     * Returns an array of objects that are owned by this object, or an empty
     * array if none exists.
     * 
     * @return {Array}
     */    
    getOwnedQxObjects : function(){
      return this.__ownedQxObjects ? Object.values(this.__ownedQxObjects) : [];
    }
  }
});