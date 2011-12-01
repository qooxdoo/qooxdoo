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

/* ************************************************************************
#asset(qx/icon/Tango/48/places/user-home.png)
#asset(qx/icon/Tango/32/places/folder-open.png)
************************************************************************ */

qx.Class.define("qx.test.mobile.basic.Atom",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testLabel : function()
    {
      var atom = new qx.ui.mobile.basic.Atom("myText");
      this.getRoot().add(atom);

      this.assertString(atom.getLabel());
      this.assertEquals(atom.getLabel(), "myText");
      this.assertEquals(atom.getLabel(), atom.getLabelWidget().getContainerElement().innerHTML);

      atom.setLabel("mySecondText");
      this.assertEquals(atom.getLabel(), "mySecondText");
      this.assertEquals(atom.getLabel(), atom.getLabelWidget().getContainerElement().innerHTML);

      atom.destroy();
    },

    testIcon : function()
    {
      var imageURL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/user-home.png");
      var atom = new qx.ui.mobile.basic.Atom("myText", imageURL);
      this.getRoot().add(atom);

      this.assertString(atom.getIcon());
      this.assertEquals(atom.getIconWidget().getSource(), imageURL);
      // atom.getIconWidget().getContainerElement().src is usually in the form:
      // http://127.0.0.1/tablet/framework/test/html/qx/icon/Tango/48/places/folder-remote.png
      // but http://127.0.0.1/tablet/framework/test/html/ differs on where you test it
      console.log(atom.getIconWidget().getContainerElement().src);
      console.log(imageURL);
      this.assertTrue(atom.getIconWidget().getContainerElement().src.indexOf("qx/icon/Tango/48/places/user-home.png") != -1);

      var image2URL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/32/places/folder-open.png");

      atom.setIcon(image2URL);
      this.assertEquals(atom.getIcon(), image2URL);
      this.assertTrue(atom.getIconWidget().getContainerElement().src.indexOf("qx/icon/Tango/32/places/folder-open.png") != -1);

      atom.destroy();
    },

    testShow : function()
    {
      var imageURL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/user-home.png");
      var atom = new qx.ui.mobile.basic.Atom("myText", imageURL);
      this.getRoot().add(atom);

      this.assertTrue(atom.getIconWidget().isVisible());
      this.assertTrue(atom.getLabelWidget().isVisible());

      atom.setShow('label');
      this.assertFalse(atom.getIconWidget().isVisible());
      this.assertTrue(atom.getLabelWidget().isVisible());

      atom.setShow('icon');
      this.assertTrue(atom.getIconWidget().isVisible());
      this.assertFalse(atom.getLabelWidget().isVisible());

      /*atom.setShow('both');
      this.assertTrue(atom.getIconWidget().isVisible());
      this.assertTrue(atom.getLabelWidget().isVisible());*/
    },

    testIconPosition : function()
    {
      /*var imageURL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/user-home.png");
      var atom = new qx.ui.mobile.basic.Atom("myText", imageURL);
      this.getRoot().add(atom);
      this.getRoot()._domUpdated();

      var iconElement = atom.getIconWidget().getContainerElement();
      var labelElement = atom.getLabelWidget().getContainerElement();

      this.assertTrue(qx.bom.element.Location.getLeft(iconElement) <= qx.bom.element.Location.getLeft(labelElement));

      atom.setIconPosition('top');
      this.assertTrue(qx.bom.element.Location.getTop(iconElement) <= qx.bom.element.Location.getTop(labelElement));

      atom.setIconPosition('bottom');
      this.assertTrue(qx.bom.element.Location.getTop(iconElement) >= qx.bom.element.Location.getTop(labelElement));

      atom.setIconPosition('right');
      this.assertTrue(qx.bom.element.Location.getLeft(iconElement) >= qx.bom.element.Location.getLeft(labelElement));

      atom.setIconPosition('left');
      this.assertTrue(qx.bom.element.Location.getLeft(iconElement) <= qx.bom.element.Location.getLeft(labelElement));
      */
    },
    testGap : function()
    {
      var imageURL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/user-home.png");
      var atom = new qx.ui.mobile.basic.Atom("myText", imageURL);
      this.getRoot().add(atom);

      console.log(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-right'));
      this.assertEquals(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-right'), '4px');

      atom.setGap(5);
      console.log(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-right'));
      this.assertEquals(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-right'), '5px');

      atom.setIconPosition('bottom');
      console.log(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-right'));
      this.assertEquals(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-right'), '0px');
      this.assertEquals(qx.bom.element.Style.get(atom.getIconWidget().getContainerElement(), 'margin-top'), '5px');
    }
  }

});
