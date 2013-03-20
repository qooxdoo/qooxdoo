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
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("qx.test.bom.element.AnimationJs",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    testStop : function() {
      var el = qx.dom.Element.create("div");
      var handle = qx.bom.element.AnimationJs.animate(el, {
        "duration": 100,
        "keyFrames": {
          0 : {"opacity": 1},
          100 : {"opacity": 0}
        },
        "delay" : 200
      });
      var spy = this.spy();
      handle.on("start", spy);
      handle.stop();
      this.wait(500, function() {
        this.assertNotCalled(spy);
      }, this);
    },

    "test animate properties which are CSS properties and element attributes" : function() {
      var el = qx.dom.Element.create("img");
      qx.bom.element.Style.setStyles(el, { width: "200px", height: "200px" });

      document.body.appendChild(el);

      var handle = qx.bom.element.Animation.animate(el, {
        "duration": 100,
        "keyFrames": {
          0 : { "width": "200px", "height": "200px" },
          100 : { "width": "400px", "height": "400px" }
        },
        "keep" : 100
      });

      this.wait(500, function() {
        this.assertEquals("400px", qx.bom.element.Style.get(el, "width"));
        this.assertEquals("400px", qx.bom.element.Style.get(el, "height"));
      }, this);

      document.body.removeChild(el);
    }
  }
});
