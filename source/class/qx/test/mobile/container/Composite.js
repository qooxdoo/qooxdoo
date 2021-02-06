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

qx.Class.define("qx.test.mobile.container.Composite",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testAdd : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      this._assertChildren(composite, 2);

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testAddSame : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertException(function() {
           composite.add(widget1);
        });
      }

      this._assertChildren(composite, 1);

      widget1.destroy();
      composite.destroy();
    },


    testAddOther : function()
    {
      var composite1 = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite1);
      var composite2 = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite2);

      var widget = new qx.ui.mobile.core.Widget();
      composite1.add(widget);

      this._assertChildren(composite1, 1);

      composite2.add(widget);

      this._assertChildren(composite1, 0);
      this.assertFalse(composite1.getContainerElement().hasChildNodes());

      this._assertChildren(composite2, 1);
      this.assertEquals(composite2.getContainerElement(), widget.getContainerElement().parentNode);

      widget.destroy();
      composite1.destroy();
      composite2.destroy();
    },


    testAddAt : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      var widget3 = new qx.ui.mobile.core.Widget();
      composite.addAt(widget3, 1);

      this.assertEquals(composite.indexOf(widget3), 1);

      this.assertEquals(composite.getContentElement().childNodes[1], widget3.getContainerElement());

      widget1.destroy();
      widget2.destroy();
      widget3.destroy();
      composite.destroy();
    },


    testAddBefore : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertException(function() {
           composite.addBefore(widget2, widget3);
        });
      }

      var widget3 = new qx.ui.mobile.core.Widget();
      composite.addBefore(widget3, widget2);

      this.assertEquals(composite.indexOf(widget3), 1);

      this.assertEquals(composite.getContentElement().childNodes[1], widget3.getContainerElement());

      widget1.destroy();
      widget2.destroy();
      widget3.destroy();
      composite.destroy();
    },


    testAddAfter : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertException(function() {
           composite.addAfter(widget2, widget3);
        });
      }

      var widget3 = new qx.ui.mobile.core.Widget();
      composite.addAfter(widget3, widget2);

      this.assertEquals(composite.indexOf(widget3), 2);

      this.assertEquals(composite.getContentElement().childNodes[2], widget3.getContainerElement());

      composite.remove(widget3);

      composite.addAfter(widget3, widget1);

      this.assertEquals(composite.getContentElement().childNodes[1], widget3.getContainerElement());

      widget1.destroy();
      widget2.destroy();
      widget3.destroy();
      composite.destroy();
    },


    testDestroy : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      this._assertChildren(composite, 2);

      widget1.destroy();
      widget2.destroy();

      this._assertChildren(composite, 0);

      composite.destroy();
    },


    testRemove : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      this._assertChildren(composite, 2);

      composite.remove(widget1);
      this._assertChildren(composite, 1);

      composite.remove(widget2);
      this._assertChildren(composite, 0);

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testRemoveAt : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      this.assertException(function() {
         composite.removeAt(1);
      });

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      var widget3 = new qx.ui.mobile.core.Widget();
      composite.add(widget3);

      this._assertChildren(composite, 3);

      composite.removeAt(1);
      this._assertChildren(composite, 2);

      this.assertEquals(widget1, composite.getChildren()[0]);
      this.assertEquals(widget3, composite.getChildren()[1]);

      widget1.destroy();
      widget2.destroy();
      widget3.destroy();
      composite.destroy();
    },


    testRemoveAll : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      this._assertChildren(composite, 2);

      composite.removeAll();
      this._assertChildren(composite, 0);

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    testHasChildren : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      this.assertFalse(composite.hasChildren());

      var widget = new qx.ui.mobile.core.Widget();
      composite.add(widget);

      this.assertTrue(composite.hasChildren());

      widget.destroy();

      this.assertFalse(composite.hasChildren());

      composite.destroy();
    },


    testIndexOf : function()
    {
      var composite = new qx.ui.mobile.container.Composite();
      this.getRoot().add(composite);

      var widget1 = new qx.ui.mobile.core.Widget();
      composite.add(widget1);

      var widget2 = new qx.ui.mobile.core.Widget();
      composite.add(widget2);

      this.assertNumber(composite.indexOf(widget1));
      this.assertEquals(composite.indexOf(widget1), 0);
      this.assertNumber(composite.indexOf(widget2));
      this.assertEquals(composite.indexOf(widget2), 1);

      widget1.destroy();
      widget2.destroy();
      composite.destroy();
    },


    _assertChildren : function(composite, number)
    {
      var children = composite.getChildren();
      this.assertNotNull(children);
      var length = children.length;
      this.assertEquals(length, number);
      length = composite.getContainerElement().childNodes.length;
      this.assertEquals(length, number);
    }

  }

});
