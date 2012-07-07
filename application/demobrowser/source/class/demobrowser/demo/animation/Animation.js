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

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.animation.Animation",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // check for annimation support
      if (qx.core.Environment.get("css.animation") == null) {
        var label = document.createElement('label');
        label.innerHTML = "CSS animations not supported, sorry!";
        document.body.appendChild(label);
        return;
      }

      var css = {duration: 1000, timing: "ease-out", keyFrames : {
        0 : {},
        70 : {"width" : "200px"},
        100 : {}
      }};

      var transform = {duration: 1000, keyFrames : {
          0: {"scale": [1,1], "rotate" : ["0deg", "0deg"], "skew": "0deg", "translate" : "0px"},
          50: {"scale": [1, 0.2], "rotate" : ["0deg", "90deg"], "skew": "10deg", "translate": "-50px"},
          100: {"scale": [1,1], "rotate" : ["0deg", "0deg"], "skew": "0deg", "translate": "0px"}
        }
      };

      var translate = {duration: 1000, keyFrames : {
          0: {"translate" : ["0px", "0px"]},
          50: {"translate": ["50px", "20px"]},
          100: {"translate": ["0px", "0px"]}
        }
      };

      var scale = {duration: 1000, origin : "bottom center", keyFrames : {
          0: {"scale" : [1, 1]},
          50: {"scale": [2, 0.1]},
          100: {"scale": [1, 1]}
        }
      };

      var rotate2d = {duration: 1000, keep: 100, keyFrames : {
          0: {"rotate" : "0deg"},
          100: {"rotate": "360deg"}
        }
      };

      var rotate3d = {duration: 1000, keyFrames : {
          0: {"rotate" : ["0deg", "0deg", "0deg"]},
          50: {"rotate": ["180deg", "180deg", "90deg"]},
          100: {"rotate" : ["0deg", "0deg", "0deg"]}
        }
      };

      var skew = {duration: 1000, origin : "bottom left", keyFrames : {
          0: {"skew" : "0deg"},
          50: {"skew": "-20deg"},
          100: {"skew": "0deg"}
        }
      };

      var shake = {duration: 1000, keyFrames : {
        0 : {translate: "0px"},
        10 : {translate: "-10px"},
        20 : {translate: "10px"},
        30 : {translate: "-10px"},
        40 : {translate: "10px"},
        50 : {translate: "-10px"},
        60 : {translate: "10px"},
        70 : {translate: "-10px"},
        80 : {translate: "10px"},
        90 : {translate: "-10px"},
        100 : {translate: "0px"}
      }};

      var tada = {duration: 1000, keyFrames : {
        0 :  {scale: 1, rotate: "0deg"},
        10 : {scale: 0.9, rotate: "-3deg"},
        20 : {scale: 0.9, rotate: "-3deg"},
        30 : {scale: 1.1, rotate: "3deg"},
        40 : {scale: 1.1, rotate: "-3deg"},
        50 : {scale: 1.1, rotate: "3deg"},
        60 : {scale: 1.1, rotate: "-3deg"},
        70 : {scale: 1.1, rotate: "3deg"},
        80 : {scale: 1.1, rotate: "-3deg"},
        90 : {scale: 1.1, rotate: "3deg"},
        100 : {scale: 1, rotate: "0deg"}
      }};

      var rotateOut = {duration: 500, origin: "left bottom", keyFrames : {
        0: {opacity: 1, rotate: "0deg"},
        100: {opacity: 0, rotate: "90deg"}
      }};

      var rotateIn = {duration: 500, origin: "left bottom", keyFrames : {
        0: {opacity: 0, rotate: "90deg"},
        100: {opacity: 1, rotate: "0deg"}
      }};

      var upAndAway = {duration : 500, timing: "ease-out", keyFrames : {
        0 : {translate : [null, "0px"], opacity: 1},
        30 : {translate : [null, "10px"], opacity : 1},
        100 : {translate : [null, "-50px"], opacity: 0}
      }};

      var fall = {duration: 1000, keep: 100, timing: "ease-in", origin: "bottom center", keyFrames : {
        0: {rotate : ["0deg"], skew: ["0deg"]},
        30 : {rotate : ["90deg"], skew: ["-20deg"]},
        100: {rotate : ["0deg"], skew: ["0deg"]}
      }};

      var tests = {
        "Tada" : tada,
        "Shake" : shake,
        "Skew" : skew,
        "Rotate" : rotate2d,
        "Scale" : scale,
        "translate" : translate,
        "Width" : css,
        "Fast Width": css,
        "Rotate Out" : rotateOut,
        "Rotate In" : rotateIn,
        "Up and out" : upAndAway,
        "3D Rotate" : rotate3d,
        "3D Transform" : transform,
        "3D Fall" : fall
      };

      for (var test in tests) {
        var button = document.createElement("div");
        button.innerHTML = test;
        button.className = "button";
        document.body.appendChild(button);

        // check for transforms
        if (!(qx.core.Environment.get("css.transform")["name"])) {
          button.style.color = "red";
          button.style.cursor = "not-allowed";
          continue;
        }

        // check for 3D animations
        if (test.indexOf("3D") != -1 && !(qx.core.Environment.get("css.transform")["3d"])) {
          button.style.color = "red";
          button.style.cursor = "not-allowed";
          continue;
        }
        button.addEventListener("click",
          (function(animation, test) {
            return function(e) {
              qx.bom.element.Animation.animate(e.target, animation, test == "Fast Width" ? 300 : undefined);
            }
          })(tests[test], test)
        );
      }

      // print a warning if no transforms are supported
      if (!(qx.core.Environment.get("css.transform")["name"])) {
        var warning = document.createElement("h1");
        warning.style.color = "red";
        warning.style.clear = "both";
        warning.style["padding-top"] = "20px";
        warning.innerHTML = "Sorry, no CSS transforms supported";
        document.body.appendChild(warning);
      }
    }
  }
});
