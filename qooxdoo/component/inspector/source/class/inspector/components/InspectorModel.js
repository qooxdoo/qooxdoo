/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("inspector.components.InspectorModel",
{
  extend : qx.core.Object,

  implement : [inspector.components.IInspectorModel],

  // objectRegistry {qx.core.ObjectRegistry}
  // application {inspector.Application}
  construct : function(application) {
    this.base(arguments);

    this.__application = application;
  },

  events :
  {
    "changeObjects" : "qx.event.type.Event",

    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    __objectRegistry : null,

    __application : null,

    __inspected : null,

    getObjectRegistry : function() {
      return this.__objectRegistry;
    },

    setObjectRegistry : function(objectRegistry) {
      if (this.__objectRegistry !== objectRegistry)
      {
        this.__objectRegistry = objectRegistry;
        this.fireEvent("changeObjects");
      }
    },

    getApplication : function() {
      return this.__application;
    },

    setApplication : function(application) {
      if (this.__application !== application)
      {
        this.__application = application;
        this.fireEvent("changeObjects")
      }
    },

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

    getInspected : function() {
      return this.__inspected;
    },

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
