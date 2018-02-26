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

/* ************************************************************************
************************************************************************ */
/**
 *
 * @asset(qx/icon/${qx.icontheme}/48/places/user-home.png)
 * @asset(qx/icon/${qx.icontheme}/32/places/folder-open.png)
 */

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

      atom.setShow('both');
      this.assertTrue(atom.getIconWidget().isVisible());
      this.assertTrue(atom.getLabelWidget().isVisible());
    },


    testIconPosition : function()
    {
      var imageURL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/user-home.png");
      var atom = new qx.ui.mobile.basic.Atom("myTextmyTextmyTextmyTextmyText", imageURL);
      this.getRoot().add(atom);
      this.getRoot()._domUpdated();

      var iconElement = atom.getIconWidget().getContentElement();
      var labelElement = atom.getLabelWidget().getContentElement();

      atom.setIconPosition('top');
      this.assertTrue(qx.bom.element.Location.getTop(iconElement) <= qx.bom.element.Location.getTop(labelElement), "setIconPosition(top): iconElement.top is greater than labelElement.top");
      this.assertTrue(atom.getIconWidget().getLayoutParent().getLayout().basename === "VBox","Layout of IconPosition Top should be VBox ");
      this.assertFalse(atom.getIconWidget().getLayoutParent().getLayout().isReversed(),"Layout should not be reversed.");

      atom.setIconPosition('bottom');
      this.assertTrue(atom.getIconWidget().getLayoutParent().getLayout().basename === "VBox","Layout of IconPosition Bottom should be VBox ");
      this.assertTrue(atom.getIconWidget().getLayoutParent().getLayout().isReversed(),"Layout should be reversed.");

      atom.setIconPosition('left');
      this.assertTrue(atom.getIconWidget().getLayoutParent().getLayout().basename === "HBox","Layout of IconPosition Left should be HBox ");
      var labelLeft = qx.bom.element.Location.getLeft(labelElement);
      var iconLeft = qx.bom.element.Location.getLeft(iconElement);
      this.assertTrue(iconLeft <= labelLeft, "setIconPosition(left): iconElement.left is greater than labelElement.left");
      this.assertFalse(atom.getIconWidget().getLayoutParent().getLayout().isReversed(),"Layout should not be reversed.");

      atom.setIconPosition('right');
      this.assertTrue(atom.getIconWidget().getLayoutParent().getLayout().basename === "HBox","Layout of IconPosition Right should be HBox ");
      this.assertTrue(atom.getIconWidget().getLayoutParent().getLayout().isReversed(),"Layout should be reversed.");

      labelLeft = qx.bom.element.Location.getLeft(labelElement);
      iconLeft = qx.bom.element.Location.getLeft(iconElement);
      this.assertTrue(iconLeft >= labelLeft, "setIconPosition(right): iconElement.left is lower than labelElement.left");


      this.getRoot()._domUpdated();
    },


    testSetLabelAndIcon : function() {

      var testText = "test234";

      var imageURL = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/user-home.png");

      var atom = new qx.ui.mobile.basic.Atom();
      atom.setLabel(testText);
      atom.setIcon(imageURL);

      var atomElement = atom.getContentElement();
      var atomChildrenLength = atomElement.children[0].children.length;

      var atomIconTag = atomElement.children[0].children[0].tagName;
      var atomIconInnerHtml = atomElement.children[0].children[0].innerHTML;
      var atomLabelInnerHtml = atomElement.children[0].children[1].innerHTML;

      this.assertEquals("IMG", atomIconTag, 'Unexpected atom children tag');
      this.assertEquals(2, atomChildrenLength, 'Unexpected count of atom element children');
      this.assertEquals('',atomIconInnerHtml, 'Child element of icon has wrong content');
      this.assertEquals(testText,atomLabelInnerHtml, 'Child element of icon has wrong content');
    }
  }

});
