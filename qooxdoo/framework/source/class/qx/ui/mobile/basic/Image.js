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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 * 
 * The image widget displays an image file.
 * 
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var image = new qx.ui.mobile.basic.Image("path/to/icon.png");
 *
 *   this.getRoot().add(image);
 * </pre>
 *
 * This example create a widget to display the image
 * <code>path/to/icon.png</code>.
 *
 */
qx.Class.define("qx.ui.mobile.basic.Image",
{
  extend : qx.ui.mobile.core.Widget,


  /**
   * @param source {String?null} The URL of the image to display.
   */
  construct : function(source)
  {
    this.base(arguments);
    if (source) {
      this.setSource(source);
    } else {
      this.initSource();
    }
  },

  properties : 
  {
    /**
     * The URL of the image to display.
     */
    source : 
    {
      check : "String",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    }
  },

  members :
  {
    // overridden
    _getTagName : function() {
      return "img";
    },


    // overridden
    _applyAttribute : function(value, old, attribute)
    {
      value = qx.util.ResourceManager.getInstance().toUri(value);
      this.base(arguments, value, old, attribute);
    }
  },


  defer : function(statics) {
    qx.ui.mobile.core.Widget.addAttributeMapping("source" , "src");
  }
});
