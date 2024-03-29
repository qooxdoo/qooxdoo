/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.util.ResourceManager", {
  extend: qx.dev.unit.TestCase,

  members: {
    testHasResource() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertTrue(ResourceManager.has("qx/static/blank.gif"));
    },

    testGetData() {
      var resourceData = [1, 1, "gif", "qx"];
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertArrayEquals(
        ResourceManager.getData("qx/static/blank.gif"),
        resourceData,
        "Resource data not identical"
      );
    },

    testGetImageWidth() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertEquals(
        ResourceManager.getImageWidth("qx/static/blank.gif"),
        1
      );
    },

    testGetImageHeight() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertEquals(
        ResourceManager.getImageWidth("qx/static/blank.gif"),
        1
      );
    },

    testGetImageFormat() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertEquals(
        ResourceManager.getImageFormat("qx/static/blank.gif"),
        "gif"
      );

      this.assertEquals(
        ResourceManager.getImageFormat("@FontAwesome/heart"),
        "font"
      );
    },

    testIsFontUri() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertTrue(ResourceManager.isFontUri("@FontAwesome/heart"));
      this.assertFalse(ResourceManager.isFontUri("qx/static/blank.gif"));
      this.assertFalse(ResourceManager.isFontUri(undefined));
    },

    testIsClippedImage() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      this.assertFalse(
        ResourceManager.getCombinedFormat("qx/static/blank.gif") != ""
      );
    },

    testToUri() {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      var resourceUri =
        qx.$$libraries["qx"].resourceUri + "/" + "qx/static/blank.gif";
      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("io.ssl")
      ) {
        var href = window.location.href;
        resourceUri =
          href.substring(0, href.lastIndexOf("/") + 1) + resourceUri;
      }
      this.assertEquals(
        resourceUri,
        ResourceManager.toUri("qx/static/blank.gif")
      );
    }
  }
});
