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
qx.Interface.define("inspector.components.IInspectorModel",
{

  events :
  {
    "changeObjects" : "qx.event.type.Event",

    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    getObjectRegistry : function() {
      return true;
    },

    setObjectRegistry : function(objectRegistry) {
      return arguments.length == 1;
    },

    getApplication : function() {
      return true;
    },

    setApplication : function(application) {
      return arguments.length == 1;
    },

    getObjects : function() {
      return true;
    },

    getInspected : function() {
      return true;
    },

    setInspected : function(object) {
      return arguments.length == 1;
    }
  }
});