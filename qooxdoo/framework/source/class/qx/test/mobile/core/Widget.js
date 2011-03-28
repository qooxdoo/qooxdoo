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

qx.Class.define("qx.test.mobile.core.Widget",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testCreate : function()
    {
      var widget = new qx.ui.mobile.core.Widget().set({id:"affe"});
      this.getRoot().add(widget);

      var element = document.getElementById("affe");
      this.assertElement(element);

      widget.destroy();
    },


    testNameProperty : function()
    {
      var widget = new qx.ui.mobile.core.Widget().set({name:"affe"});
      this.getRoot().add(widget);

      var element = document.getElementsByName("affe")[0];
      this.assertElement(element);

      var name = widget.getName();
      this.assertEquals(name, "affe");
      widget.destroy();
    },


    testSetCssClass : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      this.getRoot().add(widget);

      var element = widget.getContainerElement();

      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "");

      widget.setDefaultCssClass("affe");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "affe");

      /*
      widget.setDefaultCssClass("foo bar");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "foo bar");
      */

      widget.setDefaultCssClass("bar");
      var className = qx.bom.element.Class.get(element);
      this.assertEquals(className, "bar");

      widget.destroy();
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

      widget.destroy();
    },


    testAutoId : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      var clazz =  qx.ui.mobile.core.Widget;
      var id = clazz.ID_PREFIX + (clazz.getCurrentId() - 1);
      var element = document.getElementById(id);
      this.assertElement(element);

      var widgetId = widget.getId();
      this.assertEquals(widgetId, id);

      widget.destroy();
    },


    testWidgetRegistration : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      var id = widget.getId();
      widget = qx.ui.mobile.core.Widget.getWidgetById(id);
      this.assertQxMobileWidget(widget);

      widget.destroy();
    },


    testWidgetRegistrationSameId : function()
    {
      var widget = new qx.ui.mobile.core.Widget().set({id:"affe"});

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertException(function() {
          var widget2 = new qx.ui.mobile.core.Widget().set({id:"affe"});
        });
      }

      widget.destroy();
    },


    testTranslationAvailable : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      this.assertTrue(qx.Class.hasMixin(qx.ui.mobile.core.Widget, qx.locale.MTranslation), "No translation mixin found");
      this.assertFunction(widget.tr);

      widget.destroy();
    },


    testDestroy : function()
    {
      var widget = new qx.ui.mobile.core.Widget();

      var id = widget.getId();
      widget.destroy();
      widget = qx.ui.mobile.core.Widget.getWidgetById(id);
      this.assertUndefined(widget);
      var element = document.getElementById(id);
      this.assertNull(element);
    },


    testDomUpdatedFired : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.assertEventNotFired(widget, "domupdated", qx.ui.mobile.core.Widget.domUpdated);
      this.getRoot().add(widget);
      this.assertEventFired(widget, "domupdated", qx.ui.mobile.core.Widget.domUpdated);
      widget.destroy();
    }
  }
});
