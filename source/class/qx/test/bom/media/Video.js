/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qx/test/media/*)
 */

qx.Class.define("qx.test.bom.media.Video",
{
  extend : qx.test.bom.media.MediaTestCase,
  include: [qx.dev.unit.MRequirements],

  members :
  {
    _getSrc: function() {
      if (qx.core.Environment.get("html.video.h264")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/media/qx.mp4");
      } else if(qx.core.Environment.get("html.video.ogg")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/media/qx.ogv");
      } else if(qx.core.Environment.get("html.video.webm")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/media/qx.webm");
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
      this._media.setWidth(200);
      this.assertEquals(200, this._media.getWidth());
    },

    testHeight: function() {
      this._media.setWidth(200);
      this.assertEquals(200, this._media.getWidth());
    },

    testVideoWidthAndHeight: function(e) {
      this.assertEquals(0, this._media.getVideoWidth());
      this.assertEquals(0, this._media.getVideoHeight());

      //we know the video width and hight when meta data is loaded
      this._media.addListener("loadedmetadata", function(e) {
        var v = e._target;
        this.assertEquals(720, v.getVideoWidth());
        this.assertEquals(704, v.getVideoHeight());
      }, this);

      //or when the entire video is loaded
      this._media.addListener("loadeddata", function(e) {
        var v = e._target;
        this.assertEquals(720, v.getVideoWidth());
        this.assertEquals(704, v.getVideoHeight());
      }, this);
    }
  }
});
