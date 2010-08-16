/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Inspector model is responsible for the inspected application.
 */
qx.Class.define("inspector.components.InspectorModel",
{
  extend : qx.core.Object,

  implement : [inspector.components.IInspectorModel],

  construct : function() {
    this.base(arguments);

    this.__initValues();
  },

  events :
  {
    /**
     * Fired event when the inspected application changed.
     */
    "changeApplication" : "qx.event.type.Event",

    /**
     * Fired event when the inspected object changed.
     */
    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    __window : null,

    __inspected : null,

    __excludes : null,

    // interface implementation
    getApplication : function()
    {
      if (this.__window == null) {
        return null;
      } else {
        return this.__window.qx.core.Init.getApplication();
      }
    },

    // interface implementation
    setWindow : function(win)
    {
      if (this.__window !== win) {
        if (win == null) {
          this.__initValues();
        }
        this.__window = win;
        this.fireEvent("changeApplication");
      }
    },

    // interface implementation
    getWindow : function() {
      return this.__window;
    },

    // interface implementation
    getRoots : function()
    {
      var roots = [];

      var win = this.getWindow();
      if (win == null) {
        return roots;
      }

      var application = this.getApplication();
      if (application != null) {
        roots.push(application.getRoot());
      }

      var objectRegistry = this.getObjectRegistry();
      if (objectRegistry != null &&
          win.qx.Class.getByName("qx.ui.root.Inline") != null)
      {
        var objects = objectRegistry.getRegistry();
        for (var key in objects)
        {
          var object = objects[key];
          if (win.qx.Class.isSubClassOf(object.constructor, win.qx.ui.root.Inline)) {
            roots.push(object);
          }
        }
      }

      return roots;
    },

    // interface implementation
    getExcludes : function() {
      return this.__excludes;
    },

    // interface implementation
    addToExcludes : function(object)
    {
      if (object != null &&
          !qx.lang.Array.contains(this.__excludes, object)) {
        this.__excludes.push(object);
      }
    },

    /**
     * Clears all objects from the exclude list.
     * @internal
     */
    clearExcludes : function() {
      this.__excludes = [];
    },

    // interface implementation
    getObjectRegistry : function()
    {
      if (this.__window == null) {
        return null;
      } else {
        return this.__window.qx.core.ObjectRegistry;
      }
    },

    // interface implementation
    getObjects : function()
    {
      var result = [];

      var objectRegistry = this.getObjectRegistry();
      if (objectRegistry === null) {
        return result;
      }

      var objects = objectRegistry.getRegistry();
      var excludes = this.getExcludes();

      for (var objectKey in objects)
      {
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
    setInspected : function(object)
    {
      if (this.__inspected !== object)
      {
        var oldInspected = this.__inspected;
        this.__inspected = object;
        this.fireDataEvent("changeInspected", this.__inspected, oldInspected);
      }
    },

    /**
     * Helper method to set the initial values.
     */
    __initValues : function()
    {
      this.__window = null;
      this.setInspected(null);
      this.clearExcludes();
    }
  },

  destruct : function() {
    this.__window = this.__inspected = this.__excludes = null;
  }
});
