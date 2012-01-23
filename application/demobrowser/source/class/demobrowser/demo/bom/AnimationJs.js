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
qx.Class.define("demobrowser.demo.bom.AnimationJs",
{
  extend : qx.application.Native,

  members :
  {
    createButton : function(name, desc) {
      var buttons = [];
      var aniClasses = [qx.bom.element.Animation, qx.bom.element.JsAnimation];
      for (var i=0; i < aniClasses.length; i++) {
        var button = document.createElement("div");
        button.innerHTML = name;
        button.className = "button";
        buttons[i] = button;
      }
      qx.bom.Event.addNativeListener(buttons[0], "click",
        (function(animation) {
          return function(e) {
            qx.bom.element.Animation.animate(buttons[0], animation);
            qx.bom.element.JsAnimation.animate(buttons[1], animation);
          }
        })(desc)
      );

      qx.bom.Event.addNativeListener(buttons[1], "click",
        (function(animation) {
          return function(e) {
            qx.bom.element.Animation.animate(buttons[0], animation);
            qx.bom.element.JsAnimation.animate(buttons[1], animation);
          }
        })(desc)
      );

      return buttons;
    },


    main: function()
    {
      this.base(arguments);

      var width = {duration: 1000, keyFrames : {
        0 : {"width" : "30px"},
        70 : {"width" : "100px"},
        100 : {"width": "50px"}
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

      var keep = {duration: 1000, keep : [70], keyFrames : {
        0 : {"width" : "30px"},
        70 : {"width" : "100px"},
        100 : {"width": "50px"}
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

      var reverse = qx.lang.Object.clone(dance);
      reverse.reverse = true;

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



      var tests = {
        "Width" : width,
        "Height" : height,
        "Fade" : fade,
        "Move" : move,
        "Shake" : shake,
        "Dance" : dance,
        "Dance Reverse" : reverse,
        "Keep" : keep,
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
        "Ease In Out" : easeinout
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

    }
  }
});