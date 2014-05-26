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

/**
 * @asset(qx/icon/Tango/48/places/folder.png)
 * @asset(qx/icon/Tango/32/places/folder.png)
 * @asset(qx/static/blank.gif)
 */

qx.Class.define("qx.test.ui.basic.Image",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMock,

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
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
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

      var contentElement = image.getContentElement();
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        contentElement = contentElement.getChildren()[0];
      }
      var tagName = contentElement.getNodeName();
      this.assertTrue(tagName == "img");

      image.setSource("qx/icon/Tango/48/places/folder.png");
      this.flush();

      contentElement = image.getContentElement();
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        contentElement = contentElement.getChildren()[0];
      }
      var tagNameAfter = contentElement.getNodeName();
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
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

      var contentElement = image.getContentElement();
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        contentElement = contentElement.getChildren()[0];
      }
      var width = contentElement.getStyle("width");
      var height = contentElement.getStyle("height");

      image.setScale(true);
      this.flush();

      contentElement = image.getContentElement();
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        contentElement = contentElement.getChildren()[0];
      }
      this.assertEquals(parseInt(contentElement.getStyle("width")), parseInt(width));
      this.assertEquals(parseInt(contentElement.getStyle("height")), parseInt(height));

      image.destroy();
    },


    testSwitchWithDecorator : function()
    {
      var image = new qx.ui.basic.Image("qx/icon/Tango/48/places/folder.png");
      this.getRoot().add(image);

      image.setDecorator("main");
      this.flush();

      var decorator = image.getContentElement().getChild(2);

      image.setScale(true);
      this.flush();

      this.assertEquals(image.getContentElement().getChild(2), decorator);

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


    testLoadedEvent : function()
    {
      var source = "../resource/qx/icon/Tango/16/places/folder.png?"+ Date.now();
      this.assertFalse(qx.io.ImageLoader.isLoaded(source), "Image already loaded, but this should not happen!");

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

      this.wait(1000);
    },


    "test: Abort image loading on changing source" : function()
    {
      // image will be received with a delay of 2 sec
      var sourceA = "../resource/qx/test/delayedImage.php?" + Date.now();

      var sourceB = "../resource/qx/icon/Tango/16/places/folder.png?" + Date.now();

      var image = new qx.ui.basic.Image(sourceA);
      // spy the load event, it must be called twice at the end of this test
      var spyhandler = this.spy();
      image.addListener("aborted", spyhandler, this);

      this.assertTrue(qx.io.ImageLoader.isLoading(sourceA), "SourceA should be in loading state!");
      image.setSource(sourceB);
      this.assertFalse(qx.io.ImageLoader.isLoaded(sourceA), "SourceA should not be loaded after source change!");

      this.assertCalledOnce(spyhandler);
    },


    "test: Abort image loading through the ImageLoader" : function()
    {
      // image will be received with a delay of 2 sec
      var Source = "../resource/qx/test/delayedImage.php?" + Date.now();

      var image = new qx.ui.basic.Image(Source);
      // spy the load event, it must be called twice at the end of this test
      var spyhandler = this.spy();
      image.addListener("aborted", spyhandler, this);

      this.assertTrue(qx.io.ImageLoader.isLoading(Source), "Source should be in loading state!");

      qx.io.ImageLoader.abort(Source);

      this.assertFalse(qx.io.ImageLoader.isLoaded(Source), "Source should not be loaded after source change!");

      this.assertCalledOnce(spyhandler);
    },


    testLoadedEventForUnmanagedImage : function()
    {
      var source = "../resource/qx/icon/Tango/16/places/folder.png?"+ Date.now();
      this.assertFalse(qx.io.ImageLoader.isLoaded(source), "Image already loaded, but this should not happen!");

      var image = new qx.ui.basic.Image();
      // spy the load event, it must be called twice at the end of this test
      var spyhandler = this.spy();
      image.addListener("loaded", spyhandler, this);

      // load first time
      image.setSource(source);

      // load second time
      image.addListenerOnce("loaded", function(){
        image.resetSource();
        image.setSource(source);
      }, this);

      this.wait(500, function(){
        this.assertCalledTwice(spyhandler);
        // use a timeout to dipose the image because it needs to
        // end its processing after the event has been fired.
        window.setTimeout(function() {
          image.destroy();
        });
      }.bind(this));
    },


    testLoadedEventForManagedImage : function()
    {
      var source = "qx/icon/Tango/48/places/folder.png";
      var image = new qx.ui.basic.Image();
      // spy the load event, it must be called twice at the end of this test
      var spyhandler = this.spy();
      image.addListener("loaded", spyhandler, this);

      // load first time
      image.setSource(source);

      // load second time
      image.addListenerOnce("loaded", function(){
        image.resetSource();
        image.setSource(source);
      }, this);

      this.wait(500, function(){
        this.assertCalledTwice(spyhandler);
        // use a timeout to dipose the image because it needs to
        // end its processing after the event has been fired.
        window.setTimeout(function() {
          image.destroy();
        });
      }.bind(this));
    },


    testAbortedEventForUnmanagedImage : function()
    {
      var source = "../resource/qx/icon/Tango/16/places/folder.png?"+ Date.now();
      this.assertFalse(qx.io.ImageLoader.isLoaded(source), "Image already loaded, but this should not happen!");

      var image = new qx.ui.basic.Image();
      // spy the load event, it must be called twice at the end of this test
      var spyhandler = this.spy();
      image.addListener("aborted", spyhandler, this);

      // load first time
      image.setSource(source);

      // load second time
      image.addListenerOnce("loaded", function(){
        image.resetSource();
        image.setSource(source);

        // load thrice
        image.resetSource();
        image.setSource(source);
      }, this);

      this.wait(500, function(){
        //even if we called setSource thrice, the loaded event must be called only twice
        this.assertCalledOnce(spyhandler);
        // use a timeout to dipose the image because it needs to
        // end its processing after the event has been fired.
        window.setTimeout(function() {
          image.destroy();
        });
      }.bind(this));
    }
  }
});
