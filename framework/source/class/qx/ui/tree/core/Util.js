/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.ui.tree.core.Util",
{
  statics :
  {
    isNode : function(node, childProperty)
    {
      if (node == null || childProperty == null) {
        return false;
      }
      return qx.Class.hasProperty(node.constructor, childProperty);
    },


    hasChildren : function(node, childProperty, showLeafs)
    {
      showLeafs = showLeafs == null ? true : false;

      if (node == null || childProperty == null || !this.isNode(node, childProperty)) {
        return false;
      }

      var children = node.get(childProperty);
      if (showLeafs) {
        return children.length > 0;
      }
      else
      {
        for (var i = 0; i < children.getLength(); i++)
        {
          var child = children.getItem(i);
          if (this.isNode(child, childProperty)) {
            return true;
          }
        }
      }
      return false;
    }
  }
});