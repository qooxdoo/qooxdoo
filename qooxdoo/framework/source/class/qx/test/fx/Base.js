/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.fx.Base",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__elementToAnimate = qx.bom.Element.create("div");
      qx.bom.element.Style.set(this.__elementToAnimate, "backgroundColor", "orange");

      document.body.appendChild(this.__elementToAnimate);
    },


    tearDown : function()
    {
      document.body.removeChild(this.__elementToAnimate);
      this.__elementToAnimate = null;
    },


    testIsActive : function()
    {
      var effect = new qx.fx.effect.core.Fade(this.__elementToAnimate);

      this.assertFalse(effect.isActive());

      effect.start();

      this.assertTrue(effect.isActive());

      effect.addListener("setup", function(e)
      {
        this.resume(function() {
          this.assertTrue(effect.isActive());
          effect.end();
        }, this);
      }, this);

      this.wait(1000);
    }
  }
});