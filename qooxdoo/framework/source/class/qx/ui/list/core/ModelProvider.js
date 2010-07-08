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
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.list.core.ModelProvider",
{
  extend : qx.core.Object,
  implement : qx.ui.list.core.IModelProvider,

  members :
  {
    _labelPath : "label",
    
    _iconPath : "icon",
    
    setLabelPath : function(path) {
      this._labelPath = path;
    },
    
    setIconPath : function(path) {
      this._iconPath = path;
    },
    
    getLabel : function(item)
    {
      if (qx.lang.Type.isString(item)) {
        return item;
      } else {
        return item[this._labelPath];
      }
    },

    getIcon : function(item)
    {
      if (qx.lang.Type.isString(item)) {
        return null;
      } else {
        return item[this._iconPath];
      }
    }
  }
});
