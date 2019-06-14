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

/**
 * @asset(qx/icon/${qx.icontheme}/48/places/folder.png)
 */

qx.Class.define("qx.test.mobile.basic.Image",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testSrc : function()
    {
      var source = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/folder.png");
      if (qx.io.ImageLoader.isLoaded(source)) {
        this.debug("testLoadedEvent skipped! Image already loaded.");
        return;
      }
      var image = new qx.ui.mobile.basic.Image("qx/icon/Tango/48/places/folder.png");
      image.addListener("loaded", function() {
        this.resume(function() {
          // use a timeout to dispose the image because it needs to
          // end its processing after the event has been fired.
          window.setTimeout(function() {
            image.destroy();
          });
        });
      }, this);


      this.getRoot().add(image);
      this.wait();
    },


    testLoadingFailed : function()
    {
      var image = new qx.ui.mobile.basic.Image("does not exist.png" + Math.random());
      this.getRoot().add(image);

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
    }
  }

});
