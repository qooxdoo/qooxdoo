/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************
#require(qx.module.Traversing)
#require(qx.module.Animation)
************************************************************************ */
/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.animation.Timing",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var timings = ["ease", "linear", "ease-in", "ease-out", "ease-in-out"];
      var colors = ["#3399CC", "#67B8DE", "#91C9E8", "#B4DCED", "#E8F8FF"];

      // create the buttons
      for (var i=0; i < timings.length; i++) {
        var timing = timings[i];
        var bar = document.createElement("div");
        bar.innerHTML = timing;
        bar.className = "bar";
        bar.style.backgroundColor = colors[i % colors.length];
        document.body.appendChild(bar);
      };

      this.start();
      window.setInterval(this.start, 3000);
    },

    start : function() {
      q(".bar").forEach(function(item) {
        var timing = item.innerHTML;
        q(item).animate({timing: timing, duration: 2000, keep: 100, keyFrames : {
          0 : {width: "100px"},
          100 : {width: "700px"}
        }})
      });
    }
  }
});
