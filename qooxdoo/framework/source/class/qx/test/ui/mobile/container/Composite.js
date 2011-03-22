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

qx.Class.define("qx.test.ui.mobile.container.Composite",
{
  extend : qx.test.ui.mobile.MobileTestCase,

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


    _assertChildren : function(composite, number)
    {
      var children = composite.getChildren();
      this.assertNotNull(children);
      var length = children.length;
      this.assertEquals(length, number);
    }
    
  }

});
