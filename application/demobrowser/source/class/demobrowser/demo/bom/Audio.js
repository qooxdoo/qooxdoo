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

#asset(demobrowser/demo/media/knock.mp3)
#asset(demobrowser/demo/media/knock.ogg)
#asset(demobrowser/demo/media/knock.wav)

************************************************************************ */

/**
 * @tag noPlayground
 */
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
        var uri = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/knock.mp3");
      }
      else if(qx.core.Environment.get("html.audio.ogg")) {
        var uri = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/media/knock.ogg");
      } else {
        doc.add(new qx.ui.basic.Label("It seems that your browser doesn't support HTML5 audio", {left: 10, top: 10}));
        return;
      }

      var audio = new qx.bom.media.Audio(uri);

      var play = new qx.ui.form.ToggleButton("Play/Pause");
      play.addListener("changeValue", function(e) {
        if (audio.isPaused()) {
          audio.play();
        } else {
          audio.pause();
        }
      }, this);

      var mute = new qx.ui.form.ToggleButton("Mute");
      mute.addListener("changeValue", function(e) {
        if (audio.isMuted()) {
          audio.setMuted(false);
        } else {
          audio.setMuted(true);
        }
      }, this);

      var loop = new qx.ui.form.ToggleButton("Loop");
      loop.addListener("changeValue", function(e) {
        if (audio.isLoop()) {
          audio.setLoop(false);
        } else {
          audio.setLoop(true);
        }
      }, this);

      var duration = new qx.ui.basic.Label("0:00");
      duration.setTextColor("#CCC");

      var pb = new qx.ui.indicator.ProgressBar();
      pb.setHeight(21);
      pb.setWidth(220);

      audio.addListener("loadeddata", function() {
        doc.add(play, {left: 10, top: 10});
        doc.add(pb, {left : 90, top: 12});
        doc.add(duration, {left: 185, top: 15});
        doc.add(mute, {left: 314, top: 10});
        doc.add(loop, {left: 364, top: 10});

        container.getContentElement().getDomElement().appendChild(audio.getMediaObject());
        container.setWidth(400);
        container.setHeight(100);
      }, this);


      audio.addListener("timeupdate", function() {
        //duration headake
        pb.setMaximum(audio.getDuration());
        var currTime = audio.getCurrentTime();
        var hour = Math.floor(currTime/60);
        var sec = parseInt(currTime % 60);
        pb.setValue(currTime);

        duration.setValue(hour + ":" + (sec > 9 ? sec : "0" + sec));
      }, this);

      audio.addListener("ended", function() {
        if (!audio.isLoop()) {
          play.resetValue();
        }
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
