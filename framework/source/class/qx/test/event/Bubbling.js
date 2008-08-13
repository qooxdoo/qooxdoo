/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#use(qx.test.event.MockBubblingHandler)
*/

qx.Class.define("qx.test.event.Bubbling",
{
  extend : qx.dev.unit.TestCase,


  events :
  {
    "nonBubble" : "qx.event.type.Event"
  },


  members :
  {
    setUp : function()
    {
      var root = qx.bom.Element.create("div", {id: "root"});
      document.body.appendChild(root);

      // root
      //   c_1
      //     c_1_1
      //   c_2

      root.innerHTML =
        "<div id='c_1'>" +
        "<div id='c_1_1'></div>" +
        "</div>" +
        "<div id='c_2'>"

      this.c_1 = document.getElementById("c_1");
      this.c_1_1 = document.getElementById("c_1_1");
      this.c_2 = document.getElementById("c_2");
    },


    tearDown : function()
    {
      var Reg = qx.event.Registration;

      Reg.removeAllListeners(this.c_1);
      Reg.removeAllListeners(this.c_1_1);
      Reg.removeAllListeners(this.c_2);

      document.body.removeChild(document.getElementById("root"));
    },


    testBubbling : function()
    {
      var Reg = qx.event.Registration;
      var called;

      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1a")}, this);
      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1b")}, this);

      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1a")}, this);
      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1b")}, this);

      Reg.addListener(this.c_2, "bubble", function() { called.push("c_2a")}, this);
      Reg.addListener(this.c_2, "bubble", function() { called.push("c_2b")}, this);

      // fire event on c_1
      called = [];
      Reg.fireEvent(this.c_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1b"], called);

      // fire event on c_1_1
      called = [];
      Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1_1a", "c_1_1b", "c_1a", "c_1b"], called);

      // fire event on c_2
      called = [];
      Reg.fireEvent(this.c_2, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_2a", "c_2b"], called);
    },


    testContext : function()
    {
      var Reg = qx.event.Registration;
      var called;
      var contexts;

      Reg.addListener(this.c_1, "bubble", function() {
        called.push("c_1");
        contexts.push(this);
      });
      Reg.addListener(this.c_1_1, "bubble", function() {
        called.push("c_1_1a")
        contexts.push(this);
      });
      Reg.addListener(this.c_1_1, "bubble", function() {
        called.push("c_1_1b")
        contexts.push(this);
      }, this);

      called = [];
      contexts = [];

      Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);

      this.assertJsonEquals(["c_1_1a", "c_1_1b", "c_1"], called);
      this.assertEquals(3, contexts.length);
      this.assertEquals(this.c_1_1, contexts[0]);
      this.assertEquals(this, contexts[1]);
      this.assertEquals(this.c_1, contexts[2]);
    },


    testCapture : function()
    {
      var Reg = qx.event.Registration;
      var called;

      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1a")}, this, true);
      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1b")}, this);

      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1a")}, this, true);
      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1b")}, this);

      Reg.addListener(this.c_2, "bubble", function() { called.push("c_2a")}, this, true);
      Reg.addListener(this.c_2, "bubble", function() { called.push("c_2b")}, this);

      // fire event on c_1
      called = [];
      Reg.fireEvent(this.c_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1b"], called);

      // fire event on c_1_1
      called = [];
      Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1_1a", "c_1_1b", "c_1b"], called);

      // fire event on c_2
      called = [];
      Reg.fireEvent(this.c_2, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_2a", "c_2b"], called);
    },


    _stopPropagation : function(e)
    {
      e.stopPropagation();
    },


    testStopPropagation : function()
    {
      var Reg = qx.event.Registration;
      var called;

      // stop is first handler (capturing) -> handlers on the same level must be called
      Reg.addListener(this.c_1, "bubble", this._stopPropagation, this, true);

      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1a")}, this, true);
      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1b")}, this);

      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1a")}, this, true);
      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1b")}, this);

      Reg.addListener(this.c_2, "bubble", function() { called.push("c_2a")}, this, true);
      Reg.addListener(this.c_2, "bubble", function() { called.push("c_2b")}, this);

      // fire event on c_1
      called = [];
      Reg.fireEvent(this.c_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a"], called);

      // fire event on c_1_1
      called = [];
      Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a"], called);

      // fire event on c_2
      called = [];
      Reg.fireEvent(this.c_2, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_2a", "c_2b"], called);


      // stop is on target (capturing)
      Reg.removeListener(this.c_1, "bubble", this._stopPropagation, this, true);
      Reg.addListener(this.c_1_1, "bubble", this._stopPropagation, this, true);

      // fire event on c_1
      called = [];
      Reg.fireEvent(this.c_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1b"], called);

      // fire event on c_1_1
      called = [];
      Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1_1a"], called);

      // fire event on c_2
      called = [];
      Reg.fireEvent(this.c_2, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_2a", "c_2b"], called);


      // stop is on target (bubbling)
      Reg.removeListener(this.c_1_1, "bubble", this._stopPropagation, this, true);
      Reg.addListener(this.c_1_1, "bubble", this._stopPropagation, this, false);

      // fire event on c_1
      called = [];
      Reg.fireEvent(this.c_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1b"], called);

      // fire event on c_1_1
      called = [];
      Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_1a", "c_1_1a", "c_1_1b"], called);

      // fire event on c_2
      called = [];
      Reg.fireEvent(this.c_2, "bubble", qx.event.type.Event, [true, true]);
      this.assertJsonEquals(["c_2a", "c_2b"], called);
    },


    _preventDefault : function(e) {
      e.preventDefault();
    },


    testPreventDefault : function()
    {
      var Reg = qx.event.Registration;
      var called;

      // baseline: no prevent default
      Reg.addListener(this.c_1, "bubble", function() { called.push("c_1a")}, this);
      Reg.addListener(this.c_1_1, "bubble", function() { called.push("c_1_1a")}, this);
      called = [];
      var prevent = Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertTrue(prevent);
      this.assertJsonEquals(["c_1_1a", "c_1a"], called);


      // prevent default on parent
      Reg.addListener(this.c_1, "bubble", this._preventDefault, this);
      called = [];
      var prevent = Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertFalse(prevent);
      this.assertJsonEquals(["c_1_1a", "c_1a"], called);


      // stop propagation before prevent default can be called
      Reg.addListener(this.c_1_1, "bubble", this._stopPropagation, this);
      called = [];
      var prevent = Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertTrue(prevent);
      this.assertJsonEquals(["c_1_1a"], called);
      Reg.removeListener(this.c_1_1, "bubble", this._stopPropagation, this);


      // prevent default on target
      Reg.removeListener(this.c_1, "bubble", this._preventDefault, this);
      Reg.addListener(this.c_1_1, "bubble", this._preventDefault, this);
      called = [];
      var prevent = Reg.fireEvent(this.c_1_1, "bubble", qx.event.type.Event, [true, true]);
      this.assertFalse(prevent);
      this.assertJsonEquals(["c_1_1a", "c_1a"], called);


      // test on non bubbling events
      this.addListener("nonBubble", this._preventDefault, this);
      var prevent = Reg.fireEvent(this, "nonBubble", qx.event.type.Event, [false, true]);
      this.assertFalse(prevent);
      this.removeListener("nonBubble", this._preventDefault, this);


      // assert that non cancelable event raise an exception
      this.addListener("nonBubble", this._preventDefault, this);
      var self = this;
      if (this.isDebugOn())
      {
        this.assertException(function() {
          Reg.fireEvent(self, "nonBubble", qx.event.type.Event, [false, false]);
        }, qx.core.AssertionError, "Cannot prevent default action on a non cancelable event");
      };
      this.removeListener("nonBubble", this._preventDefault, this);


      // fire event with no listener -> should never be prevented
      var prevent = Reg.fireEvent(this, "nonBubble", qx.event.type.Event, [false, true]);
      this.assertTrue(prevent);
    }
  }
});