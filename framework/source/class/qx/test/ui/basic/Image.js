/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Alexander Steitz (aback)

************************************************************************ */

/**
 * @asset(qx/test/webfonts/fontawesome-webfont.*)
 * @asset(qx/icon/${qx.icontheme}/48/places/folder.png)
 * @asset(qx/icon/${qx.icontheme}/32/places/folder.png)
 * @asset(qx/static/blank.gif)
 * @asset(qx/static/drawer.png)
 * @asset(qx/static/drawer@2x.png)
 */

qx.Class.define("qx.test.ui.basic.Image",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    tearDown : function() {
      this.getSandbox().restore();
    },

    testSwitchScaling : function()
    {
      var image = new qx.ui.basic.Image;
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
      image.addListener("loadingFailed", function() {
        this.resume(function() {
          // use a timeout to dispose the image because it needs to
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
      this.addAutoDispose(image);
      image.addListener("loaded", function() {
        this.resume(function() {
          // use a timeout to dispose the image because it needs to
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
      this.addAutoDispose(image);
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
      this.addAutoDispose(image);
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
      // Known to fail in firefox:
      if (this.isFirefox()) {
        throw new qx.dev.unit.RequirementError();
      }
      var source = "../resource/qx/icon/Tango/16/places/folder.png?"+ Date.now();
      this.assertFalse(qx.io.ImageLoader.isLoaded(source), "Image already loaded, but this should not happen!");

      var image = new qx.ui.basic.Image();
      this.addAutoDispose(image);
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
        // use a timeout to dispose the image because it needs to
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
      this.addAutoDispose(image);
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
        // use a timeout to dispose the image because it needs to
        // end its processing after the event has been fired.
        window.setTimeout(function() {
          image.destroy();
        });
      }.bind(this));
    },


    testAbortedEventForUnmanagedImage : function()
    {
      // Known to fail in firefox:
      if (this.isFirefox()) {
        throw new qx.dev.unit.RequirementError();
      }

      var source = "../resource/qx/icon/Tango/16/places/folder.png?"+ Date.now();
      this.assertFalse(qx.io.ImageLoader.isLoaded(source), "Image already loaded, but this should not happen!");

      var image = new qx.ui.basic.Image();
      this.addAutoDispose(image);
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
        // use a timeout to dispose the image because it needs to
        // end its processing after the event has been fired.
        window.setTimeout(function() {
          image.destroy();
        });
      }.bind(this));
    },

    testWebFontImage : function() {
      this._initWebFont();

      var image = new qx.ui.basic.Image("@FontAwesome/heart");
      this.addAutoDispose(image);

      var el = image.getContentElement();
      this.assertEquals("", el.getValue());

      var width = image.getWidth();
      var height = image.getHeight();

      // No scale
      image.setScale(false);
      image.setWidth(20);
      this.assertEquals("40px", el.getStyle("fontSize"));

      // Scale
      image.setScale(true);
      this.assertEquals("20px", el.getStyle("fontSize"));

      image.setWidth(30);
      this.assertEquals("30px", el.getStyle("fontSize"));

      // Back to no scale
      image.setScale(false);
      image.setWidth(40);
      this.assertEquals("40px", el.getStyle("fontSize"));

      // Set size via name postfix
      image.setSource("@FontAwesome/heart/55");
      this.assertEquals("55px", el.getStyle("fontSize"));

      // Check revert to default size
      image.setSource("@FontAwesome/heart");
      this.assertEquals("40px", el.getStyle("fontSize"));

      // Change content element
      image.setSource("icon/16/apps/office-spreadsheet.png");
      el = image.getContentElement();
      this.assertInstance(el, qx.html.Image);

      image.setSource("@FontAwesome/arrow_right");
      el = image.getContentElement();
      this.assertInstance(el, qx.html.Label);

      // Set back by unicode number
      image.setSource("@FontAwesome/f004");
      this.assertEquals("", el.getValue());

      // reset source
      image.resetSource();
      this.assertEquals(null, el.getValue());

      image.destroy();
    },

    testHighResImage: function () {
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        this.skip();
      }

      var devicePixelRatioStub = this.stub(
        qx.bom.client.Device,
        "getDevicePixelRatio",
        function () {
          return 2;
        }
      );

      var image = new qx.ui.basic.Image("qx/static/drawer.png");
      this.addAutoDispose(image);
      var resourceManager = qx.util.ResourceManager.getInstance();

      this.assertTrue(resourceManager.has("qx/static/drawer@2x.png"));
      this.assertEquals("qx/static/drawer@2x.png", image.getContentElement().getSource());

      image.destroy();

      devicePixelRatioStub.restore();
    },

    testHighResImageWithDecoratorAndSourceInConstructor: function () {
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        this.skip();
      }

      var devicePixelRatioStub = this.stub(
        qx.bom.client.Device,
        "getDevicePixelRatio",
        function () {
          return 2;
        }
      );

      var image = new qx.ui.basic.Image("qx/static/drawer.png");
      this.addAutoDispose(image);
      image.setDecorator("toolbar-part");
      var resourceManager = qx.util.ResourceManager.getInstance();

      this.assertTrue(resourceManager.has("qx/static/drawer@2x.png"));

      var backgroundImage = image.getContentElement().getStyle("backgroundImage");
      this.assertTrue(backgroundImage.indexOf("drawer@2x.png") > -1);
      this.assertTrue(backgroundImage.indexOf("toolbar-part.gif") > -1);

      image.destroy();

      devicePixelRatioStub.restore();
    },

    testHighResImageWithDecoratorAndSourceInSetter: function () {
      if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
        this.skip();
      }

      var devicePixelRatioStub = this.stub(
        qx.bom.client.Device,
        "getDevicePixelRatio",
        function () {
          return 2;
        }
      );

      var image = new qx.ui.basic.Image();
      this.addAutoDispose(image);
      image.setDecorator("toolbar-part");
      image.setSource("qx/static/drawer.png");
      var resourceManager = qx.util.ResourceManager.getInstance();

      this.assertTrue(resourceManager.has("qx/static/drawer@2x.png"));

      var backgroundImage = image.getContentElement().getStyle("backgroundImage");
        this.assertTrue(backgroundImage.indexOf("drawer@2x.png") > -1);
      this.assertTrue(backgroundImage.indexOf("toolbar-part.gif") > -1);

      image.destroy();

      devicePixelRatioStub.restore();
    },

    isFirefox : function()
    {
      return qx.core.Environment.get("engine.name") === "gecko";
    },

    /**
     * @ignore(qx.theme.icon.Font)
     */
    _initWebFont : function()
    {
      qx.$$resources["@FontAwesome/heart"] = [40, 40, 61444];
      qx.$$resources["@FontAwesome/arrow_right"] = [40, 47, 61537];

      var currentFont = qx.theme.manager.Font.getInstance().getTheme();

      // Add font definitions
      var config = {
        fonts: {
          "FontAwesome": {
            size: 40,
            lineHeight: 1,
            comparisonString : "\uf1e3\uf1f7\uf11b\uf19d",
            family: ["FontAwesome"],
            sources: [
              {
                family: "FontAwesome",
                source: [
                  "qx/test/webfonts/fontawesome-webfont.ttf" , "qx/test/webfonts/fontawesome-webfont.woff"
                ]
              }
            ]
          }
        }
      };

      qx.Theme.define("qx.theme.icon.Font", config);
      qx.Theme.include(currentFont, qx.theme.icon.Font);
    }

  }
});
