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

/**
 * Responsible for checking all relevant CSS transform properties.
 * 
 * Specs: 
 * http://www.w3.org/TR/css3-2d-transforms/
 * http://www.w3.org/TR/css3-3d-transforms/
 * 
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.CssTransform", 
{
  statics :
  {
    /**
     * Main check method which returns an object if CSS animations are 
     * supported. This object contains all necessary keys to work with CSS 
     * animations.
     * <ul>
     *  <li><code>style</code> The name of the css transform style</li>
     *  <li><code>origin</code> The name of the transform-origin style</li>
     *  <li><code>3d</code> Whether 3d transforms are supported</li>
     * </ul>
     * 
     * @internal
     * @return {Object|null} The described object or null, if animations are 
     *   not supported.
     */
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


    /**
     * Checks for the style name used to set the transform origin.
     * @internal
     * @return {String|null} The name of the style or null, if the style is 
     *   not supported.
     */
    getOrigin : function() {
      return qx.bom.Style.getPropertyName("TransformOrigin");
    },


    /**
     * Checks for the style name used for transforms.
     * @internal
     * @return {String|null} The name of the style or null, if the style is 
     *   not supported.
     */
    getStyle : function() {
      return qx.bom.Style.getPropertyName("Transform");
    },


    /**
     * Checks if 3D transforms are supported.
     * @internal
     * @return {Boolean} <code>true</code>, if 3D transformations are supported
     */
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