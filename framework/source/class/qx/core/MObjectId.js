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
 * The typical use of IDs is to override the `_createObjectImpl` method and create
 * new instances on demand; all code should access these instances by calling
 * `getObject`.
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
    
    __ownedObjects: null,
    __changingOwner: false,

    /**
     * Apply owner
     */
    _applyQxOwner : function(value, oldValue) {
      if (!this.__changingOwner) {
        throw new Error("Please use API methods to change owner, not the property");
      }
    },
    
    /**
     * Apply objectId
     */
    _applyQxObjectId : function(value, oldValue) {
      if (!this.__changingOwner) {
        var owner = this.getQxOwner();
        if (owner) {
          owner.__onOwnedObjectIdChange(this, value, oldValue);
        }
        this._cascadeObjectIdChanges();
      }
    },
    
    /**
     * Called when a child's objectId changes
     */
    __onOwnedObjectIdChange: function(obj, newId, oldId) {
      delete this.__ownedObjects[oldId];
      this.__ownedObjects[newId] = obj;
    },
    
    /**
     * Reflect changes to IDs or owners
     */
    _cascadeObjectIdChanges: function() {
      if (typeof this.getContentElement == "function") {
        var contentElement = this.getContentElement();
        if (contentElement) {
          contentElement.updateObjectId();
        }
      }
      if (this.__ownedObjects) {
        for (var name in this.__ownedObjects) {
          this.__ownedObjects[name]._cascadeObjectIdChanges();
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
    getObject: function(id) {
      if (this.__ownedObjects) {
        var obj = this.__ownedObjects[id];
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
          var tmp = target.getObject(seg);
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
        result = this._createObject(id);
      }
      
      if (result && controlId) {
        var childControl = result.getChildControl(controlId);
        return childControl;
      }
      
      return result;
    },
    
    /**
     * Creates the object and adds it to a list; most classes are expected to
     * override `_createObjectImpl` NOT this method.
     * 
     * @param id {String} ID of the object
     * @return {qx.core.Object?} the created object
     */
    _createObject: function(id) {
      var result = this._createObjectImpl(id);
      if (result !== undefined) {
        this.addOwnedObject(result, id);
      }
      return result;
    },
    
    /**
     * Creates the object, intended to be overridden. Null is a valid return
     * value and will be cached by `getObject`, however `undefined` is NOT a
     * valid value and so will not be cached meaning that `_createObjectImpl`
     * will be called multiple times until a valid value is returned.
     * 
     * @param id {String} ID of the object
     * @return {qx.core.Object?} the created object
     */
    _createObjectImpl: function(id) {
      return undefined;
    },
    
    /**
     * Adds an object as owned by this object
     * 
     * @param obj {qx.core.Object} the object to register
     * @param id {String?} the id to set when registering the object
     */
    addOwnedObject: function(obj, id) {
      if (!this.__ownedObjects) {
        this.__ownedObjects = {};
      }
      var thatOwner = obj.getQxOwner();
      if (thatOwner === this) {
        return;
      }
      obj.__changingOwner = true;
      try {
        if (thatOwner) {
          thatOwner.__removeOwnedObjectImpl(obj);
        }
        if (id === undefined) {
          id = obj.getQxObjectId();
        }
        if (!id) {
          throw new Error("Cannot register an object that has no ID, obj=" + obj);
        }
        if (this.__ownedObjects[id]) {
          throw new Error("Cannot register an object with ID '" + id + "' because that ID is already in use, this=" + this + ", obj=" + obj);
        }
        if (obj.getQxOwner() != null) {
          throw new Error("Cannot register an object with ID '" + id + "' because it is already owned by another object this=" + this + ", obj=" + obj);
        }
        obj.setQxOwner(this);
        obj.setQxObjectId(id);
        obj._cascadeObjectIdChanges();
      } finally {
        obj.__changingOwner = false;
      }
      this.__ownedObjects[id] = obj;
    },

    /**
     * Discards an object from the list of owned objects; note that this does
     * not dispose of the object, simply forgets it if it exists.
     * 
     * @param args {String|Object} the ID of the object to discard, or the object itself
     */
    removeOwnedObject: function(args) {
      if (!this.__ownedObjects) {
        throw new Error("Cannot discard object because it is not owned by this, this=" + this + ", object=" + obj);
      }
      
      var id;
      var obj;
      if (typeof args === "string") {
        if (args.indexOf('/') > -1) {
          throw new Error("Cannot discard owned objects based on a path");
        }
        id = args;
        obj = this.__ownedObjects[id];
        if (obj === undefined) {
          return;
        }
      } else {
        obj = args;
        id = obj.getQxObjectId();
        if (this.__ownedObjects[id] !== obj) {
          throw new Error("Cannot discard object because it is not owned by this, this=" + this + ", object=" + obj);
        }
      }

      if (obj !== null) {
        obj.__changingOwner = true;
        try {
          this.__removeOwnedObjectImpl(obj);
          obj._cascadeObjectIdChanges();
        } finally {
          obj.__changingOwner = false;
        }
      }
    },
    
    __removeOwnedObjectImpl: function(obj) {
      if (obj !== null) {
        var id = obj.getQxObjectId();
        obj.setQxOwner(null);
        delete this.__ownedObjects[id];
      }
    },

    /**
     * Returns an array of objects that are owned by this object, or an empty
     * array if none exists.
     * 
     * @return {Array}
     */    
    getOwnedObjects : function(){
      return this.__ownedObjects ? Object.values(this.__ownedObjects) : [];
    }
  }
});