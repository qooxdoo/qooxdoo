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

qx.Class.define("demobrowser.demo.bom.Video",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);
      var doc = this.getRoot();

      container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      doc.add(container, {left:10, top: 40});

      if (qx.core.Environment.get("html.video.h264")) {
        var videoUrl= "http://video.blendertestbuilds.de/download.blender.org/peach/trailer_iphone.m4v";
      }
      else if(qx.core.Environment.get("html.video.ogg")) {
        var videoUrl= "http://mirror.cessen.com/blender.org/peach/trailer/trailer_400p.ogg";
      } else {
        doc.add(new qx.ui.basic.Label("It seems that your browser doesn't support HTML5 video", {left: 10, top: 10}));
        return;
      }

      video = new qx.bom.media.Video(videoUrl);

      var play = new qx.ui.form.Button("play");
      play.addListener("execute", function(e) {
        if (video.isPaused()) {
          video.play();
          play.setLabel("pause");
        } else {
          video.pause();
          play.setLabel("play");
        } 
      }, this);

      var show = new qx.ui.form.Button("show controls");
      show.addListener("execute", function(e) {
        if (video.hasControls()) {
          video.hideControls();
          show.setLabel("show controls");
        } else {
          video.showControls();
          show.setLabel("hide controls");
        } 
      }, this);

      var mute = new qx.ui.form.Button("mute");
      mute.addListener("execute", function(e) {
        if (video.isMuted()) {
          video.setMuted(false);
          mute.setLabel("mute");
        } else {
          video.setMuted(true);
          mute.setLabel("unmute");
        } 
      }, this);

      var loop = new qx.ui.form.Button("loop");
      loop.addListener("execute", function(e) {
        if (video.isLoop()) {
          video.setLoop(false);
          loop.setLabel("loop");
        } else {
          video.setLoop(true);
          loop.setLabel("unloop");
        } 
      }, this);

      var pb = new qx.ui.indicator.ProgressBar();
      pb.setHeight(21);
      pb.setWidth(140);

      video.addListener("loadeddata", function() {
        doc.add(play, {left: 10, top: 10});
        doc.add(mute, {left: 60, top: 10});
        doc.add(pb, { left : 120, top: 12});
        doc.add(loop, {left: 270, top: 10});
        doc.add(show, {left: 325, top: 10});

        container.getContentElement().getDomElement().appendChild(video.getMediaObject());

        container.setWidth(400);
        container.setHeight(400);
        video.setWidth(container.getWidth());
        video.setHeight(container.getHeight());

        pb.setMaximum(video.getDuration());
      }, this);


      video.addListener("timeupdate", function() {

        pb.setValue(video.getCurrentTime());
      }, this);

    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */
  destruct: function() {
  }
});
