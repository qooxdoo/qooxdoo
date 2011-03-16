/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/big_buck_bunny.mp4)
#asset(qx/test/big_buck_bunny.ogv)
#asset(qx/test/big_buck_bunny.webm)

************************************************************************ */

qx.Class.define("qx.test.bom.media.Video",
{
  extend : qx.test.bom.media.MediaTestCase,
  include: [qx.dev.unit.MRequirements],

  members :
  {
    _getSrc: function() {
      if (qx.core.Environment.get("html.video.h264")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/big_buck_bunny.mp4");
      } else if(qx.core.Environment.get("html.video.ogg")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/big_buck_bunny.ogg");
      } else if(qx.core.Environment.get("html.video.webm")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/big_buck_bunny.webm");
      }
    },

    _createMedia: function() {
      return new qx.bom.media.Video(this._src);
    },

    _checkFeature: function() {
      this.require(["video"]);
    },

    hasVideo: function() {
      return qx.core.Environment.get("html.video");
    },

    testWidth: function() {
    },

    testHeight: function() {
    },

    testVideoWidthAndHeight: function(e) {
      this.assertEquals(0, this._media.getVideoWidth());
      this.assertEquals(0, this._media.getVideoHeight());

      //we know the video width and hight when meta data is loaded
      this._media.addListener("loadedmetadata", function(e) {
        var v = e._target;
        this.assertEquals(640, v.getVideoWidth());
        this.assertEquals(360, v.getVideoHeight());
      }, this);

      //or when the entire video is loaded
      this._media.addListener("loadeddata", function(e) {
        var v = e._target;
        this.assertEquals(640, v.getVideoWidth());
        this.assertEquals(360, v.getVideoHeight());
      }, this);
    },

    testPoster: function() {
    }
  }
});
