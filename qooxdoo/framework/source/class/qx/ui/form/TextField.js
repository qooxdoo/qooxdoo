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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The TextField is a single-line text input field.
 */
qx.Class.define("qx.ui.form.TextField",
{
  extend : qx.ui.form.AbstractField,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "textfield"
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    },

    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  },

  members : {

    // overridden
    _renderContentElement : function(innerHeight, element) {
     // this solution doesn't work with allowGrowY : true and
     // a composite layout with 2 elements :
     // the textField with flex : 1 and a button.
     // needs more thought
     //
     // if (qx.core.Variant.isSet("qx.client", "mshtml") &&
     //     qx.bom.client.Engine.VERSION < 9)
     // {
     //   var pixel = "px";
     //   var height = innerHeight;
     //   var padding = 0;
     //   var heightHint = innerHeight - this._getContentHint().height;

     //   if (heightHint > 0) {
     //     height = heightHint;
     //     padding = height / 2;
     //   }
     //   element.setStyles({
     //     "height" : height + pixel,
     //     "padding-top" : padding + pixel,
     //     "padding-bottom" : padding + pixel
     //   });
     // }
    }
  }
});
