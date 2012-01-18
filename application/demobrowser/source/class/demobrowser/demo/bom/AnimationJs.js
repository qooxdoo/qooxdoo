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
    createButton : function(name, desc, AnimationClass) {
      var button = document.createElement("div");
      button.innerHTML = name;
      button.className = "button";

      button.addEventListener("click",
        (function(animation) {
          return function(e) {
            AnimationClass.animate(e.target, animation);
          }
        })(desc)
      );

      return button;
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


      var tests = {
        "Width" : width,
        "Height" : height,
        "Fade" : fade,
        "Move" : move
      };

      // CSS ANIMATIONS
      var h = document.createElement("h1");
      h.innerHTML = "CSS3 Animation";
      document.body.appendChild(h);
      for (var test in tests) {
        var button = this.createButton(test, tests[test], qx.bom.element.Animation);
        document.body.appendChild(button);
      }

      // JS ANIMATIONS
      h = document.createElement("h1");
      h.style["clear"] = "both";
      h.style["padding-top"] = "30px";
      h.innerHTML = "JavaScript Animation";
      document.body.appendChild(h);
      for (var test in tests) {
        var button = this.createButton(test, tests[test], qx.bom.element.JsAnimation);
        document.body.appendChild(button);
      }

    }
  }
});