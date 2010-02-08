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

/**
 * TODO
 */
qx.Class.define("inspector.objects2.Model",
{
  extend : qx.core.Object,

  // model {inspector.components.IInspectorModel}
  construct : function(model)
  {
    this.base(arguments);

    this.__model = model;
    model.addListener("changeObjects", this.__onChangeObjects, this);
    model.addListener("changeInspected", this.__onChangeInspected, this);
  },

  events :
  {
    "changeObjects" : "qx.event.type.Event",

    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    __model : null,

    getObjects : function() {
      return this.__model.getObjects();
    },

    getObjectFromHashCode : function(hashCode) {
      var objectRegestry = this.__model.getObjectRegistry();
      return objectRegestry.fromHashCode(hashCode);
    },

    getInspected : function() {
      return this.__model.getInspected();
    },

    setInspected : function(object) {
      this.__model.setInspected(object);
    },

    __onChangeObjects : function(event) {
      this.fireEvent("changeObjects");
    },

    __onChangeInspected : function(event) {
      this.fireDataEvent("changeInspected", event.getData(), event.getOldData());
    }
  },

  destruct : function() {
    this.__model.removeListener("changeObjects", this.__onChangeObjects, this);
    this.__model.removeListener("changeInspected", this.__onChangeInspected, this);
    this.__model = null;
  }
});