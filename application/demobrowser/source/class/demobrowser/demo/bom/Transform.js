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
qx.Class.define("demobrowser.demo.bom.Transform",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Show the translation function
      var box = document.getElementById("scale");
      qx.bom.element.Transform.scale(box, 0.8);

      var box = document.getElementById("translate");
      qx.bom.element.Transform.translate(box, ["10px", "10px"]);

      var box = document.getElementById("rotate");
      qx.bom.element.Transform.rotate(box, "45deg");

      var box = document.getElementById("skew");
      qx.bom.element.Transform.skew(box, "25deg");

      var box = document.getElementById("combo");
      qx.bom.element.Transform.transform(box, {
        rotate: "25deg",
        scale: [1.2, 0.6],
        skew: ["20deg", "10deg"]
      });



      // Show the origin property
      var box = document.getElementById("origin-c");
      qx.bom.element.Transform.setOrigin(box, "50% 50%");
      qx.bom.element.Transform.transform(box, {rotate: "15deg"});
      
      var box = document.getElementById("origin-lb");
      qx.bom.element.Transform.setOrigin(box, "left bottom");
      qx.bom.element.Transform.transform(box, {rotate: "15deg"});
      
      var box = document.getElementById("origin-rt");
      qx.bom.element.Transform.setOrigin(box, "right top");
      qx.bom.element.Transform.transform(box, {rotate: "15deg"});


      // Show the style property
      var box = document.getElementById("flat");
      qx.bom.element.Transform.setStyle(box, "flat");
      qx.bom.element.Transform.transform(box, {rotate: ["20deg", "40deg"]});
      qx.bom.element.Transform.transform(box.children[0], {translate : [null, null, "50px"]});

      var box = document.getElementById("3d");
      qx.bom.element.Transform.setStyle(box, "preserve-3d");
      qx.bom.element.Transform.transform(box, {rotate: ["20deg", "40deg"]});
      qx.bom.element.Transform.transform(box.children[0], {translate : [null, null, "50px"]});


      // Show the perspective property
      var box = document.getElementById("perspective30");
      qx.bom.element.Transform.setPerspective(box, 30);
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

      var box = document.getElementById("perspective100");
      qx.bom.element.Transform.setPerspective(box, 100);
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});
      
      var box = document.getElementById("perspective500");
      qx.bom.element.Transform.setPerspective(box, 500);
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});
      
      var box = document.getElementById("perspective1000");
      qx.bom.element.Transform.setPerspective(box, 1000);
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});



      // Show the perspective-origin property
      var box = document.getElementById("perorig-c");
      qx.bom.element.Transform.setPerspective(box, 100);
      qx.bom.element.Transform.setPerspectiveOrigin(box, "center");
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});

      var box = document.getElementById("perorig-bl");
      qx.bom.element.Transform.setPerspective(box, 100);
      qx.bom.element.Transform.setPerspectiveOrigin(box, "bottom left");
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});
      
      var box = document.getElementById("perorig-br");
      qx.bom.element.Transform.setPerspective(box, 100);
      qx.bom.element.Transform.setPerspectiveOrigin(box, "bottom right");
      qx.bom.element.Transform.transform(box.children[0], {rotate: ["45deg"]});



      // Show the backface-visibility property
      var box = document.getElementById("visible");
      qx.bom.element.Transform.setPerspective(box, 50);
      qx.bom.element.Transform.setBackfaceVisibility(box, true);
      qx.bom.element.Transform.transform(box, {rotate: [null, "150deg", "10deg"]});

      var box = document.getElementById("hidden");
      qx.bom.element.Transform.setPerspective(box, 100);
      qx.bom.element.Transform.setBackfaceVisibility(box, false);
      qx.bom.element.Transform.transform(box, {rotate: [null, "150deg", "10deg"]});

    }
  }
});