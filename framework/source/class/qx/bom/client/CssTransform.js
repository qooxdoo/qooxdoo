/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */


qx.Bootstrap.define("qx.bom.client.CssTransform", 
{
  statics :
  {
    getSupport : function() {
      var style = qx.bom.client.CssTransform.getStyle();
      if (style != null) {
        return {
          "style" : style,
          "origin" : qx.bom.client.CssTransform.getOrigin(),
          "3d" : qx.bom.client.CssTransform.get3D()
        };
      }
      return null;
    },


    getOrigin : function() {
      return qx.bom.Style.getPropertyName("TransformOrigin");
    },


    getStyle : function() {
      return qx.bom.Style.getPropertyName("Transform");
    },


    get3D : function() {
      var div = document.createElement('div');
      var ret = false;
      var properties = ["perspectiveProperty", "WebkitPerspective", "MozPerspective"];
      for (var i = properties.length - 1; i >= 0; i--){
        ret = ret ? ret : div.style[properties[i]] != undefined;
      };

      return ret;
    }
  },



  defer : function(statics) {
    qx.core.Environment.add("css.transform", statics.getSupport);
    qx.core.Environment.add("css.transform.3d", statics.get3D);
  }
});