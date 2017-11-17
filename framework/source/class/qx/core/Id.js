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
      
      return; // undefined
    },
    
    /**
     * Registers an object with an ID
     * 
     * @param id {String} the ID to register the object under
     * @param obj {qx.core.Object} the object to register
     */
    register: function(id, obj) {
      if (!this.__registeredObjects) {
        this.__registeredObjects = {};
      }
      this.__registeredObjects[id] = obj;
    },
    
    /**
     * Unregisters a previously registered object with an ID
     * 
     * @param id {String} the ID to unregister the object
     */
    unregister: function(id) {
      if (this.__registeredObjects) {
        delete this.__registeredObjects[id];
      }
      this.discardOwnedObject(id);
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
    }
  }
});