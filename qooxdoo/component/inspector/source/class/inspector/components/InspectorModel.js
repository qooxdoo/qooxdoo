/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * Inspector model is responsible for the registered objects ({@link #getObjects})
 * and the inspected object ({@link #getInspected}) from inspected application.
 */
qx.Class.define("inspector.components.InspectorModel",
{
  extend : qx.core.Object,

  implement : [inspector.components.IInspectorModel],

  /**
   * Constructs the model.
   * 
   * @param application {inspector.Application} the inspector application.
   */
  construct : function(application) {
    this.base(arguments);

    this.__application = application;
  },

  events :
  {
    // interface implementation
    "changeObjects" : "qx.event.type.Event",

    // interface implementation
    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    /**
     * {qx.core.ObjectRegestry} the instance to the object registry from the 
     * inspected application.
     */
    __objectRegistry : null,

    /**
     * {inspector.Application} the instance to the inspector application.
     */
    __application : null,

    /**
     * {qx.core.Object} the instance from the inspected object.
     */
    __inspected : null,

    // interface implementation
    getObjectRegistry : function() {
      return this.__objectRegistry;
    },

    // interface implementation
    setObjectRegistry : function(objectRegistry) {
      if (this.__objectRegistry !== objectRegistry)
      {
        this.__objectRegistry = objectRegistry;
        this.fireEvent("changeObjects");
      }
    },

    // interface implementation
    getApplication : function() {
      return this.__application;
    },

    // interface implementation
    setApplication : function(application) {
      if (this.__application !== application)
      {
        this.__application = application;
        this.fireEvent("changeObjects")
      }
    },

    // interface implementation
    getObjects : function()
    {
      var result = [];

      if (this.__objectRegistry === null || this.__application === null) {
        return result;
      }

      var objects = this.__objectRegistry.getRegistry();
      var excludes = this.__application.getExcludes();

      for (var objectKey in objects) {
        var object = objects[objectKey];

        if (!qx.lang.Array.contains(excludes, object)) {
          result.push(object);
        }
      }

      return result;
    },

    // interface implementation
    getInspected : function() {
      return this.__inspected;
    },

    // interface implementation
    setInspected : function(object) {
      if (this.__inspected !== object) {
        var oldInspected = this.__inspected;
        this.__inspected = object;
        this.__application.select(object);
        this.fireDataEvent("changeInspected", this.__inspected, oldInspected);
      }
    }
  },

  destruct : function() {
    this.__objectRegistry = this.constructor = this.__inspected = null;
  }
});
