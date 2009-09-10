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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("apiviewer.dao.Param", {
  extend : apiviewer.dao.ClassItem,

  construct : function(classDocNode, parentClass, method)
  {
    this.base(arguments, classDocNode, parentClass);
    this._method = method;
  },

  members : {

    getTypes : function()
    {
      var fromProperty = this.getMethod().getFromProperty();
      if (fromProperty) {
        if (fromProperty.isPropertyGroup()) {
          // handle property group setter
          var prop = this.getClass().getItemByListAndName("properties", this.getName());
          if (prop) {
            return prop.getTypes();
          }
        } else {
          // handle generated setter and getter
          return fromProperty.getTypes();
        }
      }

      var result = this.base(arguments);
      var attributes = this._docNode.attributes;
      if (attributes.type) {
        result.push({
          type : attributes.type,
          dimensions : attributes.dimensions
        });
      }
      return result;
    },

    getMethod : function() {
      return this._method;
    },

    getArrayDimensions : function() {
      return this._docNode.attributes.arrayDimensions;
    },

    getType : function() {
      return this._docNode.attributes.type;
    },

    getDefaultValue : function()
    {
      return this._docNode.attributes.defaultValue;
    }

  }

});
