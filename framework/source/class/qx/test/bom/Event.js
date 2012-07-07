/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Event",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testSupportsEvent : function()
    {
      var el = qx.dom.Element.create("div", {name: "vanillebaer"}, window);
      qx.bom.Event.addNativeListener(el, "click", function(e) {
        qx.log.Logger.info("clicked");
      });
      this.assertTrue(qx.bom.Event.supportsEvent(el, "click"));


      var el2 = qx.dom.Element.create("div", {name: "schokobaer"}, window);
      this.assertFalse(qx.bom.Event.supportsEvent(el2, "click2"));
    }
  }
});
