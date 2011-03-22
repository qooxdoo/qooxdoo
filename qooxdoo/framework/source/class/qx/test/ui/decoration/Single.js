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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.ui.decoration.Single",
{
  extend : qx.dev.unit.TestCase,

  statics :
  {
    overflow : (
      qx.core.Environment.get("engine.name") == "mshtml" &&
      parseFloat(qx.core.Environment.get("engine.version")) == 6 ?
      "overflow:hidden;" : "")
  },



  members:
  {


    testColorTop : function()
    {
      var decorator = new qx.ui.decoration.Single();
      decorator.setWidthTop(2);
      decorator.setColorTop(null);
      var markup = decorator.getMarkup();

      this.assertEquals('<div style="border-top:2px solid ;position:absolute;top:0;left:0;background-position:0 0;' + qx.test.ui.decoration.Uniform.overflow + '"></div>', markup);
    },


    testColorRight : function()
    {
      var decorator = new qx.ui.decoration.Single();
      decorator.setWidthRight(2);
      decorator.setColorRight(null);
      var markup = decorator.getMarkup();

      this.assertEquals('<div style="border-right:2px solid ;position:absolute;top:0;left:0;background-position:0 0;' + qx.test.ui.decoration.Uniform.overflow + '"></div>', markup);
    },


    testColorBottom : function()
    {
      var decorator = new qx.ui.decoration.Single();
      decorator.setWidthBottom(2);
      decorator.setColorBottom(null);
      var markup = decorator.getMarkup();

      this.assertEquals('<div style="border-bottom:2px solid ;position:absolute;top:0;left:0;background-position:0 0;' + qx.test.ui.decoration.Uniform.overflow + '"></div>', markup);
    },


    testColorLeft : function()
    {
      var decorator = new qx.ui.decoration.Single();
      decorator.setWidthLeft(2);
      decorator.setColorLeft(null);
      var markup = decorator.getMarkup();

      this.assertEquals('<div style="border-left:2px solid ;position:absolute;top:0;left:0;background-position:0 0;' + qx.test.ui.decoration.Uniform.overflow + '"></div>', markup);
    }


  }

});
