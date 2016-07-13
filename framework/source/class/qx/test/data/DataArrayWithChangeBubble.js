/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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


    testRootArray : function() {
      var m = [{b: 10}];
      m = qx.data.marshal.Json.createModel(m, true);

      var self = this;
      this.assertEventFired(m, "changeBubble", function() {
        m.getItem(0).setB("affee");
      }, function(e) {
        self.assertEquals("[0].b", e.getData().name);
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(m.getItem(0), e.getData().item);
      });
      m.dispose();
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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.append(["D"]);

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["A", "B", "C", "D"], this.array.toArray(), "Changes are not applied!");
    },

    testBubbleAfterAppend : function()
    {
      var that = this;
      var model = qx.data.marshal.Json.createModel([{ a: "0" }, { a: "1"}], true);

      var handler = function(e) {
        // check the data
        that.assertEquals("affe", e.getData().value);
        that.assertEquals("[3].a", e.getData().name, "Indexing is wrong!");
      };
      var spy = this.spy(handler);

      var moreModel = qx.data.marshal.Json.createModel([{ a: "2" }, { a: "3"}], true);
      model.append(moreModel);

      model.addListener("changeBubble", spy, this);
      model.getItem(3).setA("affe");
      this.assertCalledOnce(spy);
      this.assertEquals(4, model.length, "Length of the model is wrong!");
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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.sort(function(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
      });

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["C", "B", "A"], this.array.toArray(), "Changes are not applied!");
    },


    testSortSecondTime : function()
    {
      var that = this;
      var changeBubbleExecutionCounter = 0;

      var handler = function(e) {
        that.assertEquals(0, changeBubbleExecutionCounter, "Handler was fired more than one times.");
        that.assertArrayEquals(["C", "B", "A"], that.array.toArray(), "Changes are not applied when handler is executed!");
        // check the data
        that.assertArrayEquals(["C", "B", "A"], e.getData().value);
        that.assertEquals("data[0-2]", e.getData().name);
        that.assertArrayEquals(["A", "B", "C"], e.getData().old);
        that.assertEquals(that.array, e.getData().item);

        changeBubbleExecutionCounter ++;
      };

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.sort(function(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
      });

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["C", "B", "A"], this.array.toArray(), "Changes are not applied!");

      // Sort array second time with same method
      this.array.sort(function(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
      });
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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

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
        that.assertEquals(that.array, e.getData().item);
      };

      var spy = this.spy(handler);
      this.testObject.addListener("changeBubble", spy, this);

      this.array.unshift("D");

      this.assertCalledOnce(spy);
      this.assertArrayEquals(["D", "A", "B", "C"], this.array.toArray(), "Changes are not applied!");
    },


    testShiftAndSet : function()
    {
      // [BUG #6406]
      var model = qx.data.marshal.Json.createModel(
        [{ foo : "one" }, { foo : "two" }, { foo : "three" }], true
      );
      // first do a shift operation
      model.shift();

      var that = this;
      var handler = function(e) {
        // check the data
        that.assertEquals("zwei", e.getData().value);
        that.assertEquals("[0].foo", e.getData().name);
        that.assertEquals("two", e.getData().old);
      };

      var spy = this.spy(handler);
      model.addListener("changeBubble", spy, this);

      model.getItem(0).setFoo("zwei");
    },


    testReverseAndSet : function()
    {
      // [BUG #6406]
      var model = qx.data.marshal.Json.createModel(
        [{ foo : "one" }, { foo : "two" }, { foo : "three" }], true
      );
      // first do a shift operation
      model.reverse();

      var that = this;
      var handler = function(e) {
        // check the data
        that.assertEquals("drei", e.getData().value);
        that.assertEquals("[0].foo", e.getData().name);
        that.assertEquals("three", e.getData().old);
      };

      var spy = this.spy(handler);
      model.addListener("changeBubble", spy, this);

      model.getItem(0).setFoo("drei");
    },


    testUnshiftAndSet : function()
    {
      // [BUG #6406]
      var model = qx.data.marshal.Json.createModel(
        [{ foo : "one" }, { foo : "two" }, { foo : "three" }], true
      );
      // first do a shift operation
      model.unshift(qx.data.marshal.Json.createModel({foo: "zero"}, true));

      var that = this;
      var handler = function(e) {
        // check the data
        that.assertEquals("eins", e.getData().value);
        that.assertEquals("[1].foo", e.getData().name);
        that.assertEquals("one", e.getData().old);
      };

      var spy = this.spy(handler);
      model.addListener("changeBubble", spy, this);

      model.getItem(1).setFoo("eins");
    },

    testSortAndSet : function()
    {
      // [BUG #6406]
      var model = qx.data.marshal.Json.createModel(
        [{ foo : "one", n: 1}, { foo : "two", n: 2}, { foo : "three", n: 0}], true
      );

      // sort by number
      model.sort(function(a, b) {
        return a.getN() < b.getN() ? -1 : a.getN() > b.getN() ? 1 : 0;
      });

      var that = this;
      var handler = function(e) {
        // check the data
        that.assertEquals("drei", e.getData().value);
        that.assertEquals("[0].foo", e.getData().name);
        that.assertEquals("three", e.getData().old);
      };

      var spy = this.spy(handler);
      model.addListener("changeBubble", spy, this);

      model.getItem(0).setFoo("drei");
    },


    testSpliceAndSet : function()
    {
      // [BUG #6406]
      var model = qx.data.marshal.Json.createModel(
        [{ foo : "one" }, { foo : "two" }, { foo : "three" }], true
      );
      // first do a shift operation
      model.splice(0, 0, qx.data.marshal.Json.createModel({foo: "zero"}, true));

      var that = this;
      var handler = function(e) {
        // check the data
        that.assertEquals("eins", e.getData().value);
        that.assertEquals("[1].foo", e.getData().name);
        that.assertEquals("one", e.getData().old);
      };

      var spy = this.spy(handler);
      model.addListener("changeBubble", spy, this);

      model.getItem(1).setFoo("eins");
    }
  }
});