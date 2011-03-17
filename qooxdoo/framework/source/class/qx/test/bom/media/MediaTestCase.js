/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("qx.test.bom.media.MediaTestCase",
{
  type : "abstract",
  extend : qx.dev.unit.TestCase,

  members :
  {
    _media: null,
    _src: null,

    _getSrc: function() {
    },

    _createMedia: function() {
    },

    _checkFeature: function() {
    },


    setUp : function() {
      this._checkFeature();

      this._src = this._getSrc();
      this._media = this._createMedia();
    },

    tearDown : function() {
      this._media = null;
      this._src = null;
    },

    testGetMediaObject: function() {
      this.assertElement(this._media.getMediaObject());
    },


    testPlayPause: function() {
      this.assertTrue(this._media.isPaused());

      this._media.play();
      this.assertFalse(this._media.isPaused());

      this._media.pause();
      this.assertTrue(this._media.isPaused());
    },

    testId: function() {
      var id = "mediaid";
      this._media.setId(id);
      this.assertEquals(id, this._media.getId());
    },

    testVolume: function() {
      var that = this;

      this._media.setVolume(1);
      this.assertEquals(1, this._media.getVolume());

      this._media.setVolume(0);
      this.assertEquals(0, this._media.getVolume());

      this.assertException(function() {
        that._media.setVolume(-1);
      }, DOMException, "INDEX_SIZE_ERR");

      this.assertException(function() {
        that._media.setVolume(2);
      }, DOMException, "INDEX_SIZE_ERR");
    },


    testVolumeChange: function() {
      var vol = 0.3;
      var that = this;

      this._media.addListener("volumechange", function(e) {
        this.resume(function() {
        this.assertEquals(Math.round(vol*100), Math.round(this._media.getVolume()*100));
          this.assertInstance(e, qx.event.type.Event);
        }, this);
      }, this);

      window.setTimeout(function() {
        that._media.setVolume(vol);
      }, 0);
      this.wait();
    },

    testMute: function() {
      this.assertFalse(this._media.isMuted());

      this._media.setMuted(true);
      this.assertTrue(this._media.isMuted());

      this._media.setMuted(false);
      this.assertFalse(this._media.isMuted());
    },

    testCurrentTime: function() {
      this.assertEquals(0, this._media.getCurrentTime());

      this._media.play();
      this.wait(1200, function(e) {
          this._media.pause();
      }, this);

      this.assertTrue(this._media.getCurrentTime()>1);
    },

    testDuration: function() {
      this.assertTrue(isNaN(this._media.getDuration()));

      this._media.play();
      this.wait(1200, function(e) {
          this._media.pause();
      }, this);

      this.assertTrue(this._media.getDuration()>1);
    },


    testSource: function() {
      this._media = new qx.bom.media.Audio();

      this._media.setSource(this._src);

      var _ref = this._src.split("/");
      var expectedFile = _ref[_ref.length-1];

      _ref = this._media.getSource().split("/");
      var foundFile = _ref[_ref.length-1];

      this.assertEquals(expectedFile, foundFile);
    },


    testControls: function() {
      this.assertFalse(this._media.hasControls());

      this._media.showControls();
      this.assertTrue(this._media.hasControls());

      this._media.hideControls();
      this.assertFalse(this._media.hasControls());
    },


    testAutoplay: function() {
      this.assertTrue(this._media.isPaused());

      this._media.setAutoplay(true);
      this._media.setSource(this._src);
      this.wait(500, function(e) {
        this.assertFalse(this._media.isPaused());
        this._media.pause();
      }, this);
    },


    testPreload: function() {
      var none = "none";
      var metadata = "metadata";
      var auto = "auto";

      //default
      this.assertEquals(auto, this._media.getPreload());

      this._media.setPreload(none);
      this.assertEquals(none, this._media.getPreload());

      this._media.setPreload(metadata);
      this.assertEquals(metadata, this._media.getPreload());

      this._media.setPreload(auto);
      this.assertEquals(auto, this._media.getPreload());

      //if setting the preload to an unspecified value,
      //the preload is set to auto
      this._media.setPreload(none);
      this._media.setPreload("unspecified");
      this.assertEquals(auto, this._media.getPreload());
    },

    testLoop: function() {
      this.assertFalse(this._media.isLoop());

      this._media.setLoop(true);
      this.assertTrue(this._media.isLoop());

      this._media.setLoop(false);
      this.assertFalse(this._media.isLoop());
    },

    testPlayEvent: function() {
      this._media.addListener("play", function(e) {
        this.resume(function() {
          this.assertInstance(e, qx.event.type.Event);
          this._media.pause();
        }, this);
      }, this);

      var that = this;
      window.setTimeout(function() {
        that._media.play();
      }, 0);
      this.wait();
    },

    testPauseEvent: function() {
      this._media.addListener("pause", function(e) {
        this.resume(function() {
          this.assertInstance(e, qx.event.type.Event);
        }, this);
      }, this);

      var that = this;
      window.setTimeout(function() {
        that._media.play();
        that._media.pause();
      }, 0);
      this.wait();
    },

    testEnd: function() {
      this.assertFalse(this._media.isEnded());

      this._media.addListener("ended", function(e) {
        this.resume(function() {
          this.assertInstance(e, qx.event.type.Event);
        }, this);
      }, this);

      var that = this;
      window.setTimeout(function() {
        that._media.play();
        that.assertFalse(that._media.isEnded());
      }, 0);

      this.wait(11000, function(e) {
          this.assertTrue(this._media.isEnded());
      }, this);
    }

  }
});
