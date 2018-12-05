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
 * Provides a registry of top level objects
 */
qx.Class.define("qx.core.Id", {
  extend: qx.core.Object,
  include: [ qx.core.MObjectId ],
  type: "singleton",
  
  members: {
    
    __registeredObjects: null,
    __registeredIdHashes: null,

    /*
     * @Override
     */
    _createObjectImpl: function(id) {
      if (this.__registeredObjects) {
        var obj = this.__registeredObjects[id];
        if (obj !== undefined) {
          return obj;
        }
      }
      
      switch(id) {
        case "application":
          return qx.core.Init.getApplication() || undefined;
      }
      
      return undefined;
    },
    
    /**
     * Returns an object path which can be used to locate an object anywhere in the application
     * with a call to `qx.core.Id.getObject()`.
     * 
     * This will return null if it is not possible to calculate a path because one of the
     * ancestors has a null `objectId`.
     * 
     * This will also return null if the top-most ancestor is not one of the globals registered
     * with `registerObject` or a known global (such as the application); however, by passing
     * `false` as the `mustBeRegistered` parameter, this restriction is removed and a path will
     * still be returned (it's just that in this case, you will have to know the the root object
     * to query and `qx.core.Id.getObject` will not work on that path)  
     * 
     * @param obj {qx.core.Object} the object
     * @param mustBeRegistered {Boolean} default: true; whether the function is allowed to return
     *  a path that cannot be accessed via `qx.core.Id.getObject()`
     * @return {String} full path to the object
     */
    getAbsoluteIdOf: function(obj, mustBeRegistered) {
      var segs = [];
      var application = qx.core.Init.getApplication();
      while (obj) {
        var id = obj.getObjectId();
        if (!id) {
          this.error("Cannot determine an absolute Object ID because one of the ancestor ObjectID's is null (got as far as " + segs.join('/') + ")");
          return null;
        }
        segs.unshift(id);
        var owner = obj.getOwner();
        if (owner) {
          // Find the ID of the owner, *if* it is registered as a top level object
          var ownerId = null;
          if (owner === application) {
            ownerId = "application";
          } else {
            ownerId = this.__registeredIdHashes && this.__registeredIdHashes[owner.toHashCode()] || null;
          }

          // When we have found the ID of a top level object, add it to the path and stop 
          if (ownerId) {
            segs.unshift(ownerId);
            break;
          }
        } else {
          if (mustBeRegistered === false) {
            break;
          }
          this.error("Cannot determine a global absolute Object ID because the topmost object is not registered");
          return null;
        }
        obj = owner;
      }
      var path = segs.join("/");
      return path;
    },
    
    /**
     * Registers an object with an ID; as this is registering a global object which is the root of a tree 
     * of objects with IDs, the `id` parameter can be provided to set the ID used for the root object - this
     * allows an object to be registered under a well known, common name without affecting the API of the
     * object.  
     * 
     * @param obj {qx.core.Object} the object to register
     * @param id {String?} the ID to register the object under, otherwise the object's own Object Id is used
     */
    register: function(obj, id) {
      if (!this.__registeredObjects) {
        this.__registeredObjects = {};
        this.__registeredIdHashes = {};
      }
      if (!id) {
        id = obj.getObjectId();
      }
      this.__registeredObjects[id] = obj;
      this.__registeredIdHashes[obj.toHashCode()] = id;
    },
    
    /**
     * Unregisters a previously registered object with an ID
     * 
     * @param id {String} the ID to unregister the object
     */
    unregister: function(id) {
      if (this.__registeredObjects) {
        var obj = this.__registeredObjects[id];
        if (obj) {
          delete this.__registeredObjects[id];
          delete this.__registeredIdHashes[obj.toHashCode()];
        }
      }
      this.removeOwnedObject(id);
    }
  },
  
  statics: {
    
    /**
     * Returns a top level instance
     *
     * @param id {String} the ID to look for
     * @return {qx.core.Object?} the object
     */
    getObject: function(id) {
      return this.getInstance().getObject(id);
    },
    
    /**
     * Helper for `qx.core.Id.getAbsoluteIdOf`
     * 
     * @param obj {qx.core.Object} the object
     * @return {String} full path to the object
     */
    getAbsoluteIdOf: function(obj) {
      return this.getInstance().getAbsoluteIdOf(obj);
    }
  }
});