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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.data.DataArrayWithChangeBubble",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    testObject : null,


    array : null,


    setUp : function()
    {
      var testObject = {name: "test", data: ["A", "B", "C"]};
      this.testObject = qx.data.marshal.Json.createModel(testObject, true);
      this.array = this.testObject.getData();
    },


    tearDown : function()
    {
      this.array.dispose();
      this.testObject.dispose();
      this.array = this.testObject = null;
    },


    testAppend : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "C", "D", "E", "F"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["D", "E", "F"], e.getData().value);
        that.assertEquals("data[3-5]", e.getData().name);
        that.assertArrayEquals([], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.append(["D", "E", "F"]);

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "C", "D", "E", "F"], this.array.toArray(), "Changes are not applied!");
    },


    testAppendOne : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "C", "D"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["D"], e.getData().value);
        that.assertEquals("data[3]", e.getData().name);
        that.assertArrayEquals([], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.append(["D"]);

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "C", "D"], this.array.toArray(), "Changes are not applied!");
    },


    testInsertAfter : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "BB", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["BB"], e.getData().value);
        that.assertEquals("data[2]", e.getData().name);
        that.assertArrayEquals([], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.insertAfter("B", "BB");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "BB", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testInsertAt : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "BB", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["BB"], e.getData().value);
        that.assertEquals("data[2]", e.getData().name);
        that.assertArrayEquals([], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.insertAt(2, "BB");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "BB", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testInsertBefore : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "BB", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["BB"], e.getData().value);
        that.assertEquals("data[2]", e.getData().name);
        that.assertArrayEquals([], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.insertBefore("C", "BB");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "BB", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testPop : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals([], e.getData().value);
        that.assertEquals("data[2]", e.getData().name);
        that.assertArrayEquals(["C"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.pop();

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B"], this.array.toArray(), "Changes are not applied!");
    },


    testPush : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "C", "D"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["D"], e.getData().value);
        that.assertEquals("data[3]", e.getData().name);
        that.assertArrayEquals([], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.push("D");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "C", "D"], this.array.toArray(), "Changes are not applied!");
    },


    testRemove : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals([], e.getData().value);
        that.assertEquals("data[1]", e.getData().name);
        that.assertArrayEquals(["B"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.remove("B");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testRemoveAll : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals([], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals([], e.getData().value);
        that.assertEquals("data[0-2]", e.getData().name);
        that.assertArrayEquals(["A", "B", "C"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.removeAll();

      this.assertCalledOnce(spy);
      this.assertArrayEquals([], this.array.toArray(), "Changes are not applied!");
    },


    testRemoveAt : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals([], e.getData().value);
        that.assertEquals("data[1]", e.getData().name);
        that.assertArrayEquals(["B"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.removeAt(1);

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testReverse : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["C", "B", "A"], that.array.toArray(), "Changes are not applied when handler is executed!");

        // check the data
        that.assertArrayEquals(["C", "B", "A"], e.getData().value);
        that.assertEquals("data[0-2]", e.getData().name);
        that.assertArrayEquals(["A", "B", "C"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.reverse();

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["C", "B", "A"], this.array.toArray(), "Changes are not applied!");
    },


    testSetItem : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "BB", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["BB"], e.getData().value);
        that.assertEquals("data[1]", e.getData().name);
        that.assertArrayEquals(["B"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.setItem(1, "BB");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "BB", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testShift : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["B", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals([], e.getData().value);
        that.assertEquals("data[0]", e.getData().name);
        that.assertArrayEquals(["A"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.shift();

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["B", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testSort : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["C", "B", "A"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["C", "B", "A"], e.getData().value);
        that.assertEquals("data[0-2]", e.getData().name);
        that.assertArrayEquals(["A", "B", "C"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.sort(function(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
      });

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["C", "B", "A"], this.array.toArray(), "Changes are not applied!");
    },


    testSplice : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A", "B", "D", "E", "F"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["D", "E", "F"], e.getData().value);
        that.assertEquals("data[2-4]", e.getData().name);
        that.assertArrayEquals(["C"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.splice(2, 3, "D", "E", "F").dispose();

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "D", "E", "F"], this.array.toArray(), "Changes are not applied!");
    },


    testSpliceRemoveOnly : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["A"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals([], e.getData().value);
        that.assertEquals("data[1-2]", e.getData().name);
        that.assertArrayEquals(["B", "C"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.splice(1, 2).dispose();

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A"], this.array.toArray(), "Changes are not applied!");
    },


    testUnshift : function()
    {
      var that = this;
      var handler = function(e) {
        that.assertArrayEquals(["D", "A", "B", "C"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["D"], e.getData().value);
        that.assertEquals("data[0]", e.getData().name);
        that.assertArrayEquals(["A"], e.getData().old);
      }

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.unshift("D");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["D", "A", "B", "C"], this.array.toArray(), "Changes are not applied!");
    }
  }
});