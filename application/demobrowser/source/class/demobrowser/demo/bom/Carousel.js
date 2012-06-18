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
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Carousel",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);


      var items = ["A", "B", "C", "D", "E", "F", "G"];
      var width = 30;
      var middleWidth = 40;

      var baseColor = "#FF0000";
      var middleColor = "#00FF00";

      var offset = 30;


      var carousel = document.getElementById("carousel");
      var entries = [];
      for (var i=0; i < items.length; i++) {
        entries[i] = qx.bom.Template.get("carousel-entry", {data: items[i]})
        qx.bom.element.Class.add(entries[i], "entry");
        qx.dom.Element.insertEnd(entries[i], carousel);
      };


      for (var i=0; i < entries.length; i++) {
         qx.bom.element.Style.set(entries[i], "left", (i * width - offset) + "px");
      };


      var round = Math.floor(items.length / 2) + 1;
      var middleItem = entries[round-1];
      var middleOffset = (middleWidth - width) / 2;
      qx.bom.element.Style.setStyles(middleItem, {
        left: (parseInt(qx.bom.element.Style.get(middleItem, "left")) - middleOffset) + "px",
        backgroundColor: middleColor,
        width: middleWidth + "px",
        height: middleWidth + "px",
        top: "0px",
        zIndex: 10
      });

      window.setInterval(function() {
        for (var i=0; i < entries.length; i++) {
          var item = entries[i];
          var frames = {0 : {}, 100 :{}};

          var to = parseInt(qx.bom.element.Style.get(item, "left"))  - width;

          // left overflow
          if (to < -offset) {
            to = (entries.length-1) * width - offset;
            frames[0].opacity = 0;
            frames[99] = {opacity: 0};
            frames[100].opacity = 1;
          }

          // to middle item
          if (i == round) {
            frames[0]["background-color"] = baseColor;
            frames[100]["background-color"] = middleColor;
            frames[100].width = middleWidth + "px";
            frames[100].height = middleWidth + "px";
            frames[100].top = "0px";
            frames[100].left = (to - middleOffset) + "px";

            qx.bom.element.Style.set(item, "zIndex", 10);

          // from middle item
          } else if (i == (round + entries.length -1) % entries.length) {
            frames[0]["background-color"] = middleColor;
            frames[100]["background-color"] = baseColor;
            frames[100].width = width + "px";
            frames[100].height = width + "px";
            frames[100].top = middleOffset + "px";
            frames[100].left = (to + middleOffset) + "px";

            qx.bom.element.Style.set(item, "zIndex", 1);

          // all default items
          } else {
            frames[100].left = to + "px";
          }

          qx.bom.element.Animation.animate(item, {duration: 500, keep: 100, keyFrames : frames});
        };
        round = (round+1) % entries.length;
      }, 1000);

    }
  }
});
