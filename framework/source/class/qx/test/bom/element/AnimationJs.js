/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
    __el : null,

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

    setUp : function() {
      this.__el = qx.dom.Element.create("img");
      qx.bom.element.Style.setStyles(this.__el, { width: "200px", height: "200px" });

      document.body.appendChild(this.__el);
    },

    tearDown : function() {
      document.body.removeChild(this.__el);
      this.__el = null;
    },

    "test animate properties which are CSS properties and element attributes" : function() {

      // known to fail in chrome
      if (qx.core.Environment.get("browser.name") == "chrome") {
        throw new qx.dev.unit.RequirementError();
      }

      var handle = qx.bom.element.Animation.animate(this.__el, {
        "duration": 100,
        "keyFrames": {
          0 : { "width": "200px", "height": "200px" },
          100 : { "width": "400px", "height": "400px" }
        },
        "keep" : 100
      });

      this.wait(500, function() {
        this.assertEquals("400px", qx.bom.element.Style.get(this.__el, "width"));
        this.assertEquals("400px", qx.bom.element.Style.get(this.__el, "height"));

      }, this);
    }
  }
});
