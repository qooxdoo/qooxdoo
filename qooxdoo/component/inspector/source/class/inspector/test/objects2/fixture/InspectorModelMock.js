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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.test.objects2.fixture.InspectorModelMock",
{
  extend : qx.core.Object,

  implement : [inspector.components.IInspectorModel],

  events :
  {
    "changeObjects" : "qx.event.type.Event",

    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    _inspected : null,

    _objects : null,

    getObjectRegistry : function() {
      return null;
    },

    setObjectRegistry : function(objectRegistry) {
    },

    getApplication : function() {
      return null;
    },

    setApplication : function(application) {
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
      this.fireEvent("changeObjects");
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