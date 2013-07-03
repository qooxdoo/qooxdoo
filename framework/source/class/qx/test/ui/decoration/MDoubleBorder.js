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
     * Daniel Wagner (danielwagner)

************************************************************************ */

qx.Class.define("qx.test.ui.decoration.MDoubleBorder", {

  extend : qx.test.ui.LayoutTestCase,

  include : [qx.dev.unit.MRequirements],

  members : {

    tearDown : function()
    {
      this.base(arguments);
      this.__decorator.dispose();
      this.__widget.destroy();
    },

    hasBoxShadow : function() {
      return !!qx.core.Environment.get("css.boxshadow");
    },

    /**
     * http://bugzilla.qooxdoo.org/show_bug.cgi?id=7215
     * @lint ignoreUndefined(TestDecorator)
     */
    testCombinedDecorations : function()
    {
      this.require(["boxShadow"]);

      var Dec = qx.Class.define("TestDecorator", {
        extend : qx.ui.decoration.DynamicDecorator,
        include : [qx.ui.decoration.MDoubleBorder, qx.ui.decoration.MBoxShadow]
      });

      var dc = this.__decorator = new TestDecorator();
      dc.set({
        width: [4, 4, 4, 4],
        color: "red",
        innerWidth: [4, 4, 4, 4],
        innerColor: "green",

        shadowColor : "black",
        shadowBlurRadius : 3,
        shadowLength : 4
      });

      var w = this.__widget = new qx.ui.core.Widget();
      this.getRoot().add(w);
      w.set({
        decorator : dc
      });

      this.flush();

      var shadowProp = qx.core.Environment.get("css.boxshadow");
      var outerDecorator = w.getContainerElement().getDomElement().childNodes[1];
      this.assertTrue(qx.bom.element.Style.get(outerDecorator, shadowProp).length > 0);

      outerDecorator = w.getDecoratorElement().getDomElement();
      this.assertMatch(qx.bom.element.Style.get(outerDecorator, shadowProp), /4px 4px 3px 0px/);

      var innerDecorator = outerDecorator.firstChild;
      this.assertEquals("none", qx.bom.element.Style.get(innerDecorator, shadowProp));
    }
  }
});
