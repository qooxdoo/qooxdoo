/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Alexander Steitz (aback)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/48/places/folder.png)
#asset(qx/static/blank.gif)
************************************************************************ */


qx.Class.define("qx.test.ui.basic.Image",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testSwitchScaling : function()
    {
      var image = new qx.ui.basic.Image;
      image.set({ source: "qx/icon/Tango/48/places/folder.png", scale: false });
      this.getRoot().add(image);
      this.flush();

      var tagName = image.getContentElement().getNodeName();
      this.assertTrue(tagName == "div");

      image.setScale(true);
      this.flush();

      var tagNameAfter = image.getContentElement().getNodeName();
      if (qx.bom.element.Decoration.isAlphaImageLoaderEnabled()) {
        this.assertTrue(tagNameAfter == "div");
      } else {
        this.assertTrue(tagNameAfter == "img");
      }
      image.destroy();
    },


    testSwitchPngToGif : function()
    {
      var image = new qx.ui.basic.Image("qx/icon/Tango/48/places/folder.png");
      this.getRoot().add(image);
      this.flush();


      var tagName = image.getContentElement().getNodeName();
      this.assertTrue(tagName == "div");

      image.setSource("qx/static/blank.gif");
      this.flush();

      var tagNameAfter = image.getContentElement().getNodeName();
      this.assertTrue(tagNameAfter == "div");

      image.destroy();
    },


    testSwitchGifToPng : function()
    {
      var image = new qx.ui.basic.Image("qx/static/blank.gif");
      image.setScale(true);
      this.getRoot().add(image);
      this.flush();

      var tagName = image.getContentElement().getNodeName();
      this.assertTrue(tagName == "img");

      image.setSource("qx/icon/Tango/48/places/folder.png");
      this.flush();

      var tagNameAfter = image.getContentElement().getNodeName();
      if (qx.bom.element.Decoration.isAlphaImageLoaderEnabled()) {
        this.assertTrue(tagNameAfter == "div");
      } else {
        this.assertTrue(tagNameAfter == "img");
      }

      image.destroy();
    },


    testSwitchDimension : function()
    {
      var image = new qx.ui.basic.Image("qx/icon/Tango/48/places/folder.png");
      this.getRoot().add(image);

      image.set({ width: 100, height: 100 });
      this.flush();

      var width = image.getContentElement().getStyle("width");
      var height = image.getContentElement().getStyle("height");

      image.setScale(true);
      this.flush();

      this.assertEquals(image.getContentElement().getStyle("width"), width);
      this.assertEquals(image.getContentElement().getStyle("height"), height);

      image.destroy();
    },


    testSwitchWithDecorator : function()
    {
      var image = new qx.ui.basic.Image("qx/icon/Tango/48/places/folder.png");
      this.getRoot().add(image);

      image.setDecorator("main");
      this.flush();

      var decorator = image.getContainerElement().getChild(2);

      image.setScale(true);
      this.flush();

      this.assertEquals(image.getContainerElement().getChild(2), decorator);

      image.destroy();
    },


    testSwitchWithSelectable : function()
    {
      var image = new qx.ui.basic.Image("qx/icon/Tango/48/places/folder.png");
      this.getRoot().add(image);

      image.setSelectable(true);
      this.flush();

      var selectable = image.getContentElement().getAttribute("qxselectable");

      image.setScale(true);
      this.flush();

      var selectableAfter = image.getContentElement().getAttribute("qxselectable");

      this.assertEquals(selectable, selectableAfter);

      image.destroy();
    },


    testFailedEvent : function() {
      var image = new qx.ui.basic.Image("affe.xyz" + Math.random());
      image.addListener("loadingFailed", function() {
        this.resume(function() {
          // use a timeout to dipose the image because it needs to
          // end its processing after the event has been fired.
          window.setTimeout(function() {
            image.destroy();
          });
        });
      }, this);

      this.wait();
    },


    testLoadedEvent : function() {
      var source = "../resource/qx/icon/Tango/32/places/folder.png";
      if (qx.io.ImageLoader.isLoaded(source)) {
        this.debug("testLoadedEvent skipped! Image already loaded.");
        return;
      }
      var image = new qx.ui.basic.Image(source);
      image.addListener("loaded", function() {
        this.resume(function() {
          // use a timeout to dipose the image because it needs to
          // end its processing after the event has been fired.
          window.setTimeout(function() {
            image.destroy();
          });
        });
      }, this);

      this.wait();
    }
  }
});