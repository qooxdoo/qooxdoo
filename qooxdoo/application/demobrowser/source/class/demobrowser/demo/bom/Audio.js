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

#asset(demobrowser/demo/media/audiotest.mp3)
#asset(demobrowser/demo/media/audiotest.ogg)
#asset(demobrowser/demo/media/audiotest.wav)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Audio",
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

      if (qx.core.Environment.get("html.audio.mp3")) {
        var uri = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/audiotest.mp3");
      }
      else if(qx.core.Environment.get("html.audio.ogg")) {
        var uri = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/audiotest.ogg");
      } else {
        doc.add(new qx.ui.basic.Label("It seems that your browser doesn't support HTML5 audio", {left: 10, top: 10}));
        return;
      }

      var audio = new qx.bom.media.Audio(uri);

      var play = new qx.ui.form.Button("play");
      play.addListener("execute", function(e) {
        if (audio.isPaused()) {
          audio.play();
          play.setLabel("pause");
        } else {
          audio.pause();
          play.setLabel("play");
        } 
      }, this);

      var show = new qx.ui.form.Button("show controls");
      show.addListener("execute", function(e) {
        if (audio.hasControls()) {
          audio.hideControls();
          show.setLabel("show controls");
        } else {
          audio.showControls();
          show.setLabel("hide controls");
        } 
      }, this);

      var mute = new qx.ui.form.Button("mute");
      mute.addListener("execute", function(e) {
        if (audio.isMuted()) {
          audio.setMuted(false);
          mute.setLabel("mute");
        } else {
          audio.setMuted(true);
          mute.setLabel("unmute");
        } 
      }, this);

      var loop = new qx.ui.form.Button("loop");
      loop.addListener("execute", function(e) {
        if (audio.isLoop()) {
          audio.setLoop(false);
          loop.setLabel("loop");
        } else {
          audio.setLoop(true);
          loop.setLabel("unloop");
        } 
      }, this);

      var pb = new qx.ui.indicator.ProgressBar();
      pb.setHeight(21);
      pb.setWidth(140);

      audio.addListener("loadeddata", function() {
        doc.add(play, {left: 10, top: 10});
        doc.add(mute, {left: 60, top: 10});
        doc.add(pb, { left : 120, top: 12});
        doc.add(loop, {left: 270, top: 10});
        doc.add(show, {left: 325, top: 10});

        container.getContentElement().getDomElement().appendChild(audio.getMediaObject());

        container.setWidth(400);
        container.setHeight(400);
      }, this);


      audio.addListener("timeupdate", function() {
        pb.setValue(audio.getCurrentTime());
        pb.setMaximum(audio.getDuration());
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
