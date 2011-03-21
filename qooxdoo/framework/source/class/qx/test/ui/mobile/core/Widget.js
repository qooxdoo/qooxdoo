/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.ui.mobile.core.Widget",
{
  extend : qx.test.ui.mobile.MobileTestCase,

  members :
  {
    testCreate : function()
    {
      var widget = new qx.ui.mobile.core.Widget().set({id:"affe"});
      this.getRoot().add(widget);

      var element = document.getElementById("affe");
      this.assertElement(element);

      widget.dispose();
    },


    testNameProperty : function()
    {
      var widget = new qx.ui.mobile.core.Widget().set({name:"affe"});
      this.getRoot().add(widget);

      var element = document.getElementsByName("affe")[0];
      this.assertElement(element);

      var name = widget.getName();
      this.assertEquals(name, "affe");
      widget.dispose();
    },


    testSetCssClass : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      var element = widget.getContainerElement();

      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "");

      widget.setCssClass("affe");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "affe");

      /*
      widget.setCssClass("foo bar");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "foo bar");
      */

      widget.setCssClass("bar");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "bar");

      widget.dispose();
    },


    testAddRemoveCssClass : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      var element = widget.getContainerElement();

      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "");

      widget.addCssClass("affe");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "affe");

      widget.removeCssClass("affe");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "");

      widget.dispose();
    },


    testAutoId : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      var clazz =  qx.ui.mobile.core.Widget;
      var id = clazz.ID_PREFIX + (clazz.__idCounter - 1);
      var element = document.getElementById(id);
      this.assertElement(element);

      var widgetId = widget.getId();
      this.assertEquals(widgetId, id);

      widget.dispose();
    },


    testWidgetRegistration : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      var id = widget.getId();
      widget = qx.ui.mobile.core.Widget.getWidgetById(id);
      this.assertQxMobileWidget(widget);

      widget.dispose();
    },


    testWidgetRegistrationSameId : function()
    {
      var widget = new qx.ui.mobile.core.Widget().set({id:"affe"});

      this.assertException(function() {
        var widget2 = new qx.ui.mobile.core.Widget().set({id:"affe"});
      });

      widget.dispose();
    },


    testTranslationAvailable : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      this.assertTrue(qx.Class.hasMixin(qx.ui.mobile.core.Widget, qx.locale.MTranslation), "No translation mixin found");
      this.assertFunction(widget.tr);

      widget.dispose();
    },


    testDispose : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      var id = widget.getId();
      widget.dispose();
      widget = qx.ui.mobile.core.Widget.getWidgetById(id);
      this.assertUndefined(widget);
    }
  }

});
