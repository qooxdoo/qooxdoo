/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      this.assertTrue(widget.hasCssClass("affe"));

      widget.removeCssClass("affe");
      this.assertFalse(widget.hasCssClass("affe"));

      widget.destroy();
    },


    testAutoId : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      var clazz =  qx.ui.mobile.core.Widget;
      // decrement is 2 when qx.core.Environment.get("qx.debug.dispose") because the _root is recreated on every test,
      // and it is a widget too
      var decrement = qx.core.Environment.get("qx.debug.dispose") ? 2 : 1;
      var id = clazz.ID_PREFIX + (clazz.getCurrentId() - decrement);
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
    },


    testVisibility : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      this.__assertShow(widget);

      widget.exclude();
      this.assertFalse(widget.isVisible(), "Exclude: Widget should not be visible");
      this.assertTrue(widget.isExcluded(), "Exclude: Widget should be excluded");
      this.assertTrue(widget.isHidden(), "Exclude: Widget should be hidden");
      this.assertTrue(widget.hasCssClass("exclude"), "Exclude: No exclude class set");
      this.assertEquals("visible", widget._getStyle("visibility"), "Exclude: Visibility style should be null");

      widget.show();
      this.__assertShow(widget);

      widget.hide();
      this.assertFalse(widget.isVisible(), "Hide: Widget should not be visible");
      this.assertFalse(widget.isExcluded(), "Hide: Widget should not be excluded");
      this.assertTrue(widget.isHidden(), "Hide: Widget should be hidden");
      this.assertTrue(widget.isSeeable(), "Hide: Widget should be seeable");
      this.assertEquals("block", widget._getStyle("display"), "Hide: Display style should be block");
      this.assertFalse(widget.hasCssClass("exclude"), "Hide: Exclude class set");
      this.assertEquals("hidden", widget._getStyle("visibility"), "Hide: Visibility style should be hidden");

      widget.show();
      this.__assertShow(widget);

      widget.destroy();
    },


    __assertShow : function(widget) {
      this.assertTrue(widget.isVisible(), "Show: Widget should be visible");
      this.assertFalse(widget.isExcluded(), "Show: Widget should not be excluded");
      this.assertFalse(widget.isHidden(), "Show: Widget should not be hidden");
      this.assertTrue(widget.isSeeable(), "Show: Widget should be seeable");
      this.assertEquals("block", widget._getStyle("display"), "Show: Display style should be block");
      this.assertFalse(widget.hasCssClass("exclude"), "Hide: Exclude class set");
      this.assertEquals("visible", widget._getStyle("visibility"), "Show: Visibility style should be visible");
    },

    testEnabled : function()
    {
      var widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      this.assertEquals(true,widget.getEnabled());
      this.assertFalse(qx.bom.element.Class.has(widget.getContainerElement(),'disabled'));

      widget.setEnabled(false);
      this.assertEquals(false,widget.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(widget.getContainerElement(),'disabled'));

      this.assertEquals('none', qx.bom.element.Style.get(widget.getContainerElement(),'pointerEvents'));

      widget.destroy();

      widget = new qx.ui.mobile.core.Widget();
      this.getRoot().add(widget);

      widget.setEnabled(true);
      widget.setAnonymous(true);
      this.assertFalse(qx.bom.element.Class.has(widget.getContainerElement(),'disabled'));
      this.assertEquals('none', qx.bom.element.Style.get(widget.getContainerElement(),'pointerEvents'));

      widget.setEnabled(false);
      this.assertEquals(true,qx.bom.element.Class.has(widget.getContainerElement(),'disabled'));
      this.assertEquals('none', qx.bom.element.Style.get(widget.getContainerElement(),'pointerEvents'));

      widget.setEnabled(true);
      this.assertEquals('none', qx.bom.element.Style.get(widget.getContainerElement(),'pointerEvents'));

      widget.destroy();

    },


    testToggleCss : function() {
        var widget = new qx.ui.mobile.core.Widget();
        this.getRoot().add(widget);

        widget.toggleCssClass("test");
        this.assertTrue(widget.hasCssClass("test"));

        widget.toggleCssClass("test");
        this.assertFalse(widget.hasCssClass("test"));

        widget.destroy();
    }
  }
});
