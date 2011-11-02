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
qx.Class.define("inspector.test.objects.fixture.InspectorModelMock",
{
  extend : qx.core.Object,

  implement : [inspector.components.IInspectorModel],

  events :
  {
    "changeApplication" : "qx.event.type.Event",

    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    _inspected : null,

    _objects : null,

    getApplication : function() {},

    setWindow : function(win) {},

    getWindow : function() {
      return null;
    },

    getRoots : function() {
      return [];
    },

    addToExcludes : function(object) {
    },

    getExcludes : function() {
      return [];
    },

    getObjectRegistry : function() {
      return null;
    },

    getObjects : function()
    {
      if (this._objects === null) {
        return [];
      } else {
        return this._objects;
      }
    },

    setObjects : function(objects) {
      this._objects = objects;
      this.fireEvent("changeApplication");
    },

    getInspected : function() {
      return this._inspected;
    },

    setInspected : function(object) {
      if (this._inspected !== object) {
        var oldInspected = this._inspected;
        this._inspected = object;
        this.fireDataEvent("changeInspected", this._inspected, oldInspected);
      }
    }
  },

  destruct : function() {
    this._objects = null;
    this._inspected = null;
  }
});