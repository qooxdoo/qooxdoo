/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.animation.Animation_Compare",
{
  extend : qx.application.Native,

  members :
  {
    createButton : function(name, desc) {
      var buttons = [];
      for (var i=0; i < this.aniClasses.length; i++) {
        var button = document.createElement("div");
        button.innerHTML = name;
        button.className = "button";
        buttons[i] = button;
      }

      var onClick = (function(animation, name) {
        return function(e) {
          if (name.indexOf("Reverse") != -1) {
            qx.bom.element.AnimationCss.animateReverse(buttons[0], animation);
            qx.bom.element.AnimationJs.animateReverse(buttons[1], animation);
          } else {
            qx.bom.element.AnimationCss.animate(buttons[0], animation);
            qx.bom.element.AnimationJs.animate(buttons[1], animation);
          }

        }
      })(desc, name);

      qx.bom.Event.addNativeListener(buttons[0], "click", onClick);
      qx.bom.Event.addNativeListener(buttons[1], "click", onClick);

      return buttons;
    },


    main: function()
    {
      this.base(arguments);
      this.aniClasses = [qx.bom.element.AnimationCss, qx.bom.element.AnimationJs];


      var width = {duration: 1000, keyFrames : {
        0 : {"width" : "100px"},
        70 : {"width" : "200px"},
        100 : {"width": "100px"}
      }};

      var height = {duration: 1000, keyFrames : {
        0 : {"height" : "40px"},
        70 : {"height" : "60px"},
        100 : {"height": "40px"}
      }};

      var fade = {duration: 500, keyFrames : {
        0 : {"opacity" : 1},
        50 : {"opacity": 0},
        100 : {"opacity" : 1}
      }};

      var fadeOut = {duration: 500, keep: 100, keyFrames : {
        0 : {"opacity" : 1},
        100 : {"opacity": 0, display: "none"}
      }};


      var move = {duration: 500, keyFrames : {
        0 : {"left" : "0px", "top" : "0px"},
        80 : {"left" : "50px", "top" : "100px"},
        100 : {"left" : "0px", "top" : "0px"}
      }};

      var shake = {duration: 500, keyFrames : {
        0 : {"left" : "0px"},
        30 : {"left" : "-10px"},
        60 : {"left" : "10px"},
        80 : {"left" : "-10px"},
        100 : {"left" : "0px"}
      }};

      var dance = {duration: 500, keyFrames : {
        0 : {"left" : "0px", "top": "0px"},
        30 : {"left" : "-10px", "top": "-10px"},
        60 : {"left" : "10px", "top": "-10px"},
        80 : {"left" : "-10px", "top": "10px"},
        100 : {"left" : "0px", "top": "0px"}
      }};

      var keep = {duration: 1000, keep : 70, keyFrames : {
        0 : {"top" : "0px"},
        70 : {"top" : "5px"},
        100 : {"top": "30px"}
      }};


      var lineHeight = {duration: 1000, keyFrames : {
        0 : {"line-height" : "1"},
        88 : {"line-height" : "2"},
        100 : {"line-height": "0.3"}
      }};


      var em = {duration: 2000, keyFrames : {
        0 : {"font-size" : "1em"},
        88 : {"font-size" : "2em"},
        100 : {"font-size": "1em"}
      }};


      var percent = {duration: 1000, keyFrames : {
        0 : {"width" : "10%"},
        40 : {"width" : "20%"},
        100 : {"width": "1%"}
      }};


      var color = {duration: 1000, keyFrames : {
        0 : {"color" : "red"},
        50 : {"color" : "#124589"},
        100 : {"color": "#00FF00"}
      }};


      var twice = {duration: 500, repeat: 2, keyFrames : {
        0 : {"top": "0px"},
        50 : {"top" : "-10px"},
        100 : {"top": "0px"}
      }};

      var alternate = {duration: 500, alternate: true, repeat: 2, keyFrames : {
        0 : {"top" : "0px"},
        100 : {"top": "-50px"}
      }};


      var easein = {duration: 1000, timing: "ease-in", keep: 100, keyFrames : {
        0 : {"left" : "0px"},
        100 : {"left": "400px"}
      }};
      var easeout = qx.lang.Object.clone(easein);
      easeout.timing = "ease-out";
      var linear = qx.lang.Object.clone(easein);
      linear.timing = "linear";
      var ease = qx.lang.Object.clone(easein);
      ease.timing = "ease";
      var easeinout = qx.lang.Object.clone(easein);
      easeinout.timing = "ease-in-out";

      var missing = {duration: 1000, keyFrames: {
        0: {},
        50: {"opacity": 0},
        100 : {}
      }};


      var keepAlternate = {duration: 500, alternate: true, repeat: 2, keep : 100, keyFrames : {
        0 : {"top" : "0px"},
        100 : {"top": "50px"}
      }};


      var keepReverse = {duration: 1000, keep : 100, keyFrames : {
        0 : {"top" : "0px"},
        100 : {"top": "50px"}
      }};

      var keepAlternateReverse = {duration: 500, alternate: true, repeat: 3, keep : 100, keyFrames : {
        0 : {"top" : "0px"},
        100 : {"top": "20px"}
      }};


      var tests = {
        "Width" : width,
        "Height" : height,
        "Fade" : fade,
        "FadeOut" : fadeOut,
        "Move" : move,
        "Shake" : shake,
        "Dance" : dance,
        "Dance Reverse" : dance,
        "Keep" : keep,
        "Keep (Alt.)": keepAlternate,
        "Keep (Reverse)"  : keepReverse,
        "Keep (Reverse/Alt)"  : keepAlternateReverse,
        "Font-Size": em,
        "Line Height" : lineHeight,
        "Percent Width" : percent,
        "Color" : color,
        "Twice" : twice,
        "Alternate" : alternate,
        "Ease In" : easein,
        "Ease Out" : easeout,
        "Linear" : linear,
        "Ease" : ease,
        "Ease In Out" : easeinout,
        "Missing Values" : missing
      };

      // CSS ANIMATIONS
      var h = document.createElement("h1");
      h.innerHTML = "CSS3 Animation";
      document.body.appendChild(h);
      var cssContainer = document.createElement("div");
      document.body.appendChild(cssContainer);

      // JS ANIMATIONS
      h = document.createElement("h1");
      h.innerHTML = "JavaScript Animation";
      document.body.appendChild(h);
      var jsContainer = document.createElement("div");
      document.body.appendChild(jsContainer);

      for (var test in tests) {
        var buttons = this.createButton(test, tests[test]);
        cssContainer.appendChild(buttons[0]);
        jsContainer.appendChild(buttons[1]);
      }


      // special case for events and the handle
      var infinite = {duration: 500, alternate: true, repeat: "infinite", keyFrames : {
        0: {left: "0px"},
        100: {left: "10px"}
      }};


      // STOP
      var buttons = [];
      for (var i=0; i < this.aniClasses.length; i++) {
        var button = document.createElement("div");
        button.innerHTML = "Stop";
        button.className = "button";
        buttons[i] = button;
      }

      var onClick = (function(animation) {
        return function(e) {
          for (var i=0; i < handle.length; i++) {
            handle[i].stop();
          };
        }
      })(infinite);

      qx.bom.Event.addNativeListener(buttons[0], "click", onClick);
      qx.bom.Event.addNativeListener(buttons[1], "click", onClick);
      var handle = [];
      handle.push(qx.bom.element.AnimationCss.animate(buttons[0], infinite));
      handle.push(qx.bom.element.AnimationJs.animate(buttons[1], infinite));
      cssContainer.appendChild(buttons[0]);
      jsContainer.appendChild(buttons[1]);



      // PAUSE / PLAY
      buttons = [];
      for (var i=0; i < this.aniClasses.length; i++) {
        var button = document.createElement("div");
        button.innerHTML = "Pause";
        button.className = "button";
        buttons[i] = button;
      }

      var onClick = (function(animation) {
        return function(e) {
          for (var i=0; i < handle.length; i++) {
            if (handle2[i].el) {
              if (handle2[i].isPlaying()) {
                handle2[i].pause();
                handle2[i].el.innerHTML = "Play";
              } else {
                handle2[i].play();
                handle2[i].el.innerHTML = "Pause";
              }
            }
          };
        }
      })(infinite);

      qx.bom.Event.addNativeListener(buttons[0], "click", onClick);
      qx.bom.Event.addNativeListener(buttons[1], "click", onClick);
      var handle2 = [];
      handle2.push(qx.bom.element.AnimationCss.animate(buttons[0], infinite));
      handle2.push(qx.bom.element.AnimationJs.animate(buttons[1], infinite));
      cssContainer.appendChild(buttons[0]);
      jsContainer.appendChild(buttons[1]);



      // ITERATION EVENT
      buttons = [];
      for (var i=0; i < this.aniClasses.length; i++) {
        var button = document.createElement("div");
        button.innerHTML = "0";
        button.className = "button";
        buttons[i] = button;
        button.style.cursor = "auto";
      }

      var onIteration = function(e) {
        e.innerHTML = parseInt(e.innerHTML) + 1;
      };

      qx.bom.element.AnimationCss.animate(buttons[0], infinite).on("iteration", onIteration);
      qx.bom.element.AnimationJs.animate(buttons[1], infinite).on("iteration", onIteration);
      cssContainer.appendChild(buttons[0]);
      jsContainer.appendChild(buttons[1]);



      // DELAY
      var delay = {duration: 500, repeat: 10, delay: 2000, alternate: true, keyFrames: {
        0: {left: "0px"},
        100: {left: "10px"}
      }};

      buttons = [];
      for (var i=0; i < this.aniClasses.length; i++) {
        var button = document.createElement("div");
        button.innerHTML = "Waiting 2s";
        button.className = "button";
        buttons[i] = button;
        button.style.cursor = "auto";
      }

      var onStart = function(e) {
        e.innerHTML = "Running";
      };
      var onEnd = function(e) {
        e.innerHTML = "Ended";
      }

      var handle3 = [];
      handle3.push(qx.bom.element.AnimationCss.animate(buttons[0], delay));
      handle3.push(qx.bom.element.AnimationJs.animate(buttons[1], delay));
      for (var i=0; i < handle3.length; i++) {
        handle3[i].on("start", onStart);
        handle3[i].on("end", onEnd);
      };

      cssContainer.appendChild(buttons[0]);
      jsContainer.appendChild(buttons[1]);
    }
  }
});