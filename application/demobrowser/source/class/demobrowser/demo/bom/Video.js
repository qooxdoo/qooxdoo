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
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/media/qx.m4v)
#asset(demobrowser/demo/media/qx.ogv)
#asset(demobrowser/demo/media/qx.webm)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Video",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);
      var doc = this.getRoot();

      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      doc.add(container, {left:10, top: 40});


      if (qx.core.Environment.get("html.video.h264")) {
        var videoUrl = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/qx.m4v");
      }
      else if(qx.core.Environment.get("html.video.webm")) {
        var videoUrl = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/qx.webm");
      }
      else if(qx.core.Environment.get("html.video.ogg")) {
        var videoUrl = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/qx.ogv");
      }
      else {
        doc.add(new qx.ui.basic.Label("It seems that your browser doesn't support HTML5 video", {left: 10, top: 10}));
        return;
      }

      var video = new qx.bom.media.Video(videoUrl);

      var play = new qx.ui.form.ToggleButton("Play/Pause");
      play.addListener("changeValue", function(e) {
        if (video.isPaused()) {
          video.play();
        } else {
          video.pause();
        }
      }, this);

      var show = new qx.ui.form.ToggleButton("Native Controls");
      show.addListener("changeValue", function(e) {
        if (video.hasControls()) {
          video.hideControls();
        } else {
          video.showControls();
        }
      }, this);

      var mute = new qx.ui.form.ToggleButton("Mute");
      mute.addListener("changeValue", function(e) {
        if (video.isMuted()) {
          video.setMuted(false);
        } else {
          video.setMuted(true);
        }
      }, this);

      var loop = new qx.ui.form.ToggleButton("Loop");
      loop.addListener("changeValue", function(e) {
        if (video.isLoop()) {
          video.setLoop(false);
        } else {
          video.setLoop(true);
        }
      }, this);

      var duration = new qx.ui.basic.Label("0:00");
      duration.setTextColor("#CCC");

      var pb = new qx.ui.indicator.ProgressBar();
      pb.setHeight(21);
      pb.setWidth(220);

      video.addListener("loadeddata", function() {
        doc.add(show, {left: 315, top: 10});
        doc.add(play, {left: 10, top: 270});
        doc.add(pb, {left : 90, top: 272});
        doc.add(duration, {left: 185, top: 275});
        doc.add(mute, {left: 314, top: 270});
        doc.add(loop, {left: 364, top: 270});
        container.getContentElement().getDomElement().appendChild(video.getMediaObject());
        container.setWidth(400);
        container.setHeight(220);
        video.setWidth(container.getWidth());
        video.setHeight(container.getHeight());
      }, this);


      video.addListener("timeupdate", function() {
        //duration headake
        pb.setMaximum(video.getDuration());
        var currTime = video.getCurrentTime();
        var hour = Math.floor(currTime/60);
        var sec = parseInt(currTime % 60);
        pb.setValue(currTime);

        duration.setValue(hour + ":" + (sec > 9 ? sec : "0" + sec));
      }, this);

      video.addListener("ended", function() {
        if (!video.isLoop()) {
          play.resetValue();
        }
      }, this);

    }
  }
});
