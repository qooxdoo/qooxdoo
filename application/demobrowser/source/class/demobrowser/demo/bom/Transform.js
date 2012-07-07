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
qx.Class.define("demobrowser.demo.bom.Transform",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // check for transform support
      if (qx.core.Environment.get("css.transform") == null) {
        document.body.innerHTML = "";
        var label = document.createElement('label');
        label.innerHTML = "CSS transforms not supported, sorry!";
        document.body.appendChild(label);
        return;
      }

      // Show the translation function
      var box = document.getElementById("scale");
      qx.bom.element.Transform.scale(box, 0.8);

      box = document.getElementById("translate");
      qx.bom.element.Transform.translate(box, ["10px", "10px"]);

      box = document.getElementById("rotate");
      qx.bom.element.Transform.rotate(box, "45deg");

      box = document.getElementById("skew");
      qx.bom.element.Transform.skew(box, "25deg");

      box = document.getElementById("combo");
      qx.bom.element.Transform.transform(box, {
        rotate: "25deg",
        scale: [1.2, 0.6],
        skew: ["20deg", "10deg"]
      });



      // Show the origin property
      box = document.getElementById("origin-c");
      qx.bom.element.Transform.setOrigin(box, "50% 50%");
      qx.bom.element.Transform.transform(box, {rotate: "15deg"});

      box = document.getElementById("origin-lb");
      qx.bom.element.Transform.setOrigin(box, "left bottom");
      qx.bom.element.Transform.transform(box, {rotate: "15deg"});

      box = document.getElementById("origin-rt");
      qx.bom.element.Transform.setOrigin(box, "right top");
      qx.bom.element.Transform.transform(box, {rotate: "15deg"});




      // only do that if 3d transforms are supported
      if (qx.core.Environment.get("css.transform.3d")) {
        // Show the style property
        box = document.getElementById("flat");
        qx.bom.element.Transform.setStyle(box, "flat");
        qx.bom.element.Transform.transform(box, {rotate: ["20deg", "40deg"]});
        qx.bom.element.Transform.transform(box.children[0], {translate : [null, null, "50px"]});

        box = document.getElementById("3d");
        qx.bom.element.Transform.setStyle(box, "preserve-3d");
        qx.bom.element.Transform.transform(box, {rotate: ["20deg", "40deg"]});
        qx.bom.element.Transform.transform(box.children[0], {translate : [null, null, "50px"]});


        // Show the perspective property
        box = document.getElementById("perspective30");
        qx.bom.element.Transform.setPerspective(box, 30);
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

        box = document.getElementById("perspective100");
        qx.bom.element.Transform.setPerspective(box, 100);
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

        box = document.getElementById("perspective500");
        qx.bom.element.Transform.setPerspective(box, 500);
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

        box = document.getElementById("perspective1000");
        qx.bom.element.Transform.setPerspective(box, 1000);
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});



        // Show the perspective-origin property
        box = document.getElementById("perorig-c");
        qx.bom.element.Transform.setPerspective(box, 100);
        qx.bom.element.Transform.setPerspectiveOrigin(box, "center");
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

        box = document.getElementById("perorig-bl");
        qx.bom.element.Transform.setPerspective(box, 100);
        qx.bom.element.Transform.setPerspectiveOrigin(box, "bottom left");
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

        box = document.getElementById("perorig-br");
        qx.bom.element.Transform.setPerspective(box, 100);
        qx.bom.element.Transform.setPerspectiveOrigin(box, "bottom right");
        qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});



        // Show the backface-visibility property
        box = document.getElementById("visible");
        qx.bom.element.Transform.setPerspective(box, 50);
        qx.bom.element.Transform.setBackfaceVisibility(box, true);
        qx.bom.element.Transform.transform(box, {rotate: [null, "150deg", "10deg"]});

        box = document.getElementById("hidden");
        qx.bom.element.Transform.setPerspective(box, 100);
        qx.bom.element.Transform.setBackfaceVisibility(box, false);
        qx.bom.element.Transform.transform(box, {rotate: [null, "150deg", "10deg"]});

      } else {
        // mark all 3d stuff as not working
        document.getElementById("3dpart").style["display"] = "none";

        var label = document.createElement('label');
        label.innerHTML = "<br><br>Your browser does not support 3D CSS transforms, sorry!";
        document.body.appendChild(label);
      }
    }
  }
});
