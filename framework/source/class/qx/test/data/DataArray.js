/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.data.DataArray",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    __a: null,

    setUp : function()
    {
      this.__a = new qx.data.Array("one", "two", "three");
    },


    tearDown : function()
    {
      this.__a.dispose();
    },

    testConstructor: function() {
      // create empty array
      var a = new qx.data.Array();
      this.assertEquals(0, a.length, "Length does not fit an an empty array!");
      a.dispose();

      // create an array with a length
      a = new qx.data.Array(10);
      this.assertEquals(10, a.length, "Length does not fit an an empty array!");
      a.dispose();

      // create an array with only elements
      a = new qx.data.Array("one", "two", "three");
      this.assertEquals(3, a.length, "Length does not fit an an empty array!");
      a.dispose();
      a = new qx.data.Array(1, 2, 3);
      this.assertEquals(3, a.length, "Length does not fit an an empty array!");
      a.dispose();

      // create an array with an given native array
      var newArray = ["one", "two", "three"];
      a = new qx.data.Array(newArray);
      this.assertEquals(3, a.length, "Length does not fit an an empty array!");
      a.dispose();

      // test some wrong inputs
      this.assertException(function() {
        new qx.data.Array(true);
      }, Error, null, "Boolean not supported!");
      this.assertException(function() {
        new qx.data.Array({});
      }, Error, null, "Objects not supported!");
      this.assertException(function() {
        new qx.data.Array(function() {});
      }, Error, null, "Functions not supported!");
    },


    testGetItem: function() {
      // check the getvalue function
      this.assertEquals("one", this.__a.getItem(0), "IndexAt does not work at position 0");
      this.assertEquals("two", this.__a.getItem(1), "IndexAt does not work at position 1");
      this.assertEquals("three", this.__a.getItem(2), "IndexAt does not work at position 2");

      // try some wrong inputs
      this.assertUndefined(this.__a.getItem(-1), "There should be no element at -1");
      this.assertUndefined(this.__a.getItem(3), "There should be no element at 3");
    },


    testSetItem: function() {
      this.__a.setItem(0, "eins");
      this.assertEquals("eins", this.__a.getItem(0), "IndexAt does not work at position 0");
      this.__a.setItem(3, "drei");
      this.assertEquals("drei", this.__a.getItem(3), "IndexAt does not work at position 0");
    },


    testJoin: function() {
      this.assertEquals("one, two, three", this.__a.join(", "), "Join does not work");
    },


    testReverse: function() {
      this.__a.reverse();
      this.assertEquals("one", this.__a.getItem(2), "Reverse does not work");

      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.reverse();
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(2, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("order", e.getData().type, "Wrong type in the event.");
      }, "Change event not fired!");
      a.dispose();
    },


    testSort: function() {
      this.__a.sort();
      this.assertEquals("one three two", this.__a.join(" "), "Simple sort does not work");
      this.__a.sort(function(a, b) {
        return a > b ? -1 : 1;
      });
      this.assertEquals("two three one", this.__a.join(" "), "Own sort does not work");

      // test for the event
      var a = new qx.data.Array(2, 7, 5);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.sort();
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(2, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("order", e.getData().type, "Wrong type in the event.");
      }, "Change event not fired!");
      a.dispose();
    },


    testConcat: function() {
       var b = this.__a.concat(["four", "five"]);
       this.assertEquals("one two three four five", b.join(" "), "Concat does not work");
       b.dispose();
    },


    testSlice: function() {
      var slice = this.__a.slice(0, 1);
      this.assertEquals("one", slice.getItem(0), "Slice does not work");
      slice.dispose();
      slice = this.__a.slice(1, 2);
      this.assertEquals("two", slice.getItem(0), "Slice does not work");
      slice.dispose();
      slice = this.__a.slice(0, 2);
      this.assertEquals("one", slice.getItem(0), "Slice does not work");
      slice.dispose();
      slice = this.__a.slice(0, 2);
      this.assertEquals("two", slice.getItem(1), "Slice does not work");
      slice.dispose();
    },


    testPop: function() {
      this.assertEquals("three", this.__a.pop(), "Pop does not work.");
      this.assertEquals(2, this.__a.length, "Wrong length after pop");
      this.assertEquals("two", this.__a.pop(), "Pop does not work.");
      this.assertEquals("one", this.__a.pop(), "Pop does not work.");
      this.assertEquals(0, this.__a.length, "Wrong length after pop");
    },


    testPush: function() {
      this.assertEquals(4, this.__a.push("four"), "Push does not give the right length back.");
      this.assertEquals("one two three four", this.__a.join(" "), "Single push does not work.");
      this.assertEquals(4, this.__a.length, "Single push does not work.");
      this.__a.dispose();
      this.__a = new qx.data.Array();
      this.__a.push(1, 2, 3);
      this.assertEquals("1 2 3", this.__a.join(" "), "Multiple push does not work.");
    },


    testShift: function() {
      this.assertEquals("one", this.__a.shift(), "Shift does not work.");
      this.assertEquals("two three", this.__a.join(" "), "Shift does not work.");
      this.assertEquals("two", this.__a.shift(), "Shift does not work.");
      this.assertEquals(1, this.__a.length, "Shift does not work.");
    },


    testShiftWithEventPropagation : function() {
      var data = {
        "bar" : [1,2,3,4,5]
      };
      var model = qx.data.marshal.Json.createModel( data, true );
      this.assertEquals(1, model.getBar().shift());
      model.dispose();
    },


    testUnshift: function() {
      this.assertEquals(4, this.__a.unshift("zero"), "Unshift does not return the proper length.");
      this.assertEquals("zero one two three", this.__a.join(" "), "Unshift does not work!");
      this.assertEquals(6, this.__a.unshift("-2", "-1"), "Unshift does not return the proper length.");
      this.assertEquals("-2 -1 zero one two three", this.__a.join(" "), "Unshift does not work!");
    },


    testSplice: function() {
      var a = new qx.data.Array(1, 2, 3, 4, 5, 6, 7, 8);

      var splice = a.splice(4, a.length - 1);
      this.assertEquals("5 6 7 8", splice.join(" "), "Splice does not work");
      splice.dispose();
      this.assertEquals("1 2 3 4", a.join(" "), "Splice does not work");
      splice = a.splice(1, 2);
      this.assertEquals("2 3", splice.join(" "), "Splice does not work");
      splice.dispose();
      this.assertEquals("1 4", a.join(" "), "Splice does not work");
      a.dispose();

      var a = new qx.data.Array(1, 2, 3, 4, 5);
      splice = a.splice(2, 0, "a", "b");
      this.assertEquals("", splice.join(" "), "Splice does not work");
      splice.dispose();
      this.assertEquals("1 2 a b 3 4 5", a.join(" "), "Splice does not work");
      splice = a.splice(2, 2, "c", 3);
      this.assertEquals("a b", splice.join(" "), "Splice does not work");
      splice.dispose();
      this.assertEquals("1 2 c 3 3 4 5", a.join(" "), "Splice does not work");

      splice = a.splice(1);
      this.assertInstance(splice, qx.data.Array, "Wrong return type");
      splice.dispose();
      a.dispose();
    },


    testToArray: function() {
      this.assertEquals("one two three", this.__a.toArray().join(" "), "toArray does not work!");
      this.assertInstance( this.__a.toArray(), Array, "toArray does not work!");
    },


    testLengthEvent: function() {
      var self = this;
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      this.assertEventFired(a, "changeLength", function () {
        a.pop();
      }, function(e) {
        self.assertEquals(2, e.getData());
        self.assertEquals(3, e.getOldData());
      }, "ChangeLength event not fired!");
      a.dispose();
    },


    testToString: function() {
      this.assertEquals(this.__a.toArray().toString(), this.__a.toString(), "toString does not work!");
    },


    testContains: function() {
      this.assertTrue(this.__a.contains("one"), "contains does not work!");
      this.assertTrue(this.__a.contains("two"), "contains does not work!");
      this.assertTrue(this.__a.contains("three"), "contains does not work!");
    },


    testIndexOf: function() {
      this.assertEquals(0, this.__a.indexOf("one"), "indexOf does not work!");
      this.assertEquals(1, this.__a.indexOf("two"), "indexOf does not work!");
      this.assertEquals(2, this.__a.indexOf("three"), "indexOf does not work!");
    },


    testCopy: function(attribute) {
      var a = this.__a.copy();
      // change the original array
      this.__a.setItem(0, "0");
      this.__a.setItem(1, "1");
      this.__a.setItem(2, "2");

      // check the value
      this.assertEquals("one", a.getItem(0), "Copy does not work");
      this.assertEquals("two", a.getItem(1), "Copy does not work");
      this.assertEquals("three", a.getItem(2), "Copy does not work");

      a.dispose();
    },


    testInsertAt: function() {
      this.__a.insertAt(1, "eins");
      this.__a.insertAt(3, "drei");

      // check the value
      this.assertEquals("one", this.__a.getItem(0), "insertAt does not work");
      this.assertEquals("eins", this.__a.getItem(1), "insertAt does not work");
      this.assertEquals("two", this.__a.getItem(2), "insertAt does not work");
      this.assertEquals("drei", this.__a.getItem(3), "insertAt does not work");
      this.assertEquals("three", this.__a.getItem(4), "insertAt does not work");
    },


    testInsertBefore: function() {
      this.__a.insertBefore("two", "eins");
      this.__a.insertBefore("three", "drei");

      // check the value
      this.assertEquals("one", this.__a.getItem(0), "insertBefore does not work");
      this.assertEquals("eins", this.__a.getItem(1), "insertBefore does not work");
      this.assertEquals("two", this.__a.getItem(2), "insertBefore does not work");
      this.assertEquals("drei", this.__a.getItem(3), "insertBefore does not work");
      this.assertEquals("three", this.__a.getItem(4), "insertBefore does not work");
    },


    testInsertAfter: function() {
      this.__a.insertAfter("one", "eins");
      this.__a.insertAfter("two", "drei");

      // check the value
      this.assertEquals("one", this.__a.getItem(0), "insertAfter does not work");
      this.assertEquals("eins", this.__a.getItem(1), "insertAfter does not work");
      this.assertEquals("two", this.__a.getItem(2), "insertAfter does not work");
      this.assertEquals("drei", this.__a.getItem(3), "insertAfter does not work");
      this.assertEquals("three", this.__a.getItem(4), "insertAfter does not work");
    },


    testRemoveAt: function() {
      var removed = this.__a.removeAt(1);

      // check the value
      this.assertEquals("two", removed, "no return type");
      this.assertEquals("one", this.__a.getItem(0), "removeAt does not work");
      this.assertEquals("three", this.__a.getItem(1), "removeAt does not work");
    },


    testRemoveAll: function() {

      var self = this;
      this.assertEventFired(self.__a, "changeLength", function () {
        self.__a.removeAll();
      }, function(e) {
        self.assertEquals(0, self.__a.getLength(), "length not 0");
      }, "Change event not fired!");


      this.__a.push("a");
      this.__a.push("b");

      this.assertEventFired(self.__a, "change", function () {
        var removed = self.__a.removeAll();
        self.assertEquals(2, removed.length);
        self.assertEquals("a", removed[0]);
        self.assertEquals("b", removed[1]);
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(1, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("remove", e.getData().type, "Wrong type in the event.");
        self.assertEquals("a", e.getData().items[0]);
        self.assertEquals("b", e.getData().items[1]);
      }, "Change event not fired!");

      this.assertEquals(0, this.__a.length, "RemoveAll does not work.");
    },


    testAppend: function() {
      var dArray = new qx.data.Array("4", "5");
      this.__a.append(dArray.toArray());

      // check the value
      this.assertEquals("one", this.__a.getItem(0), "append does not work");
      this.assertEquals("two", this.__a.getItem(1), "append does not work");
      this.assertEquals("three", this.__a.getItem(2), "append does not work");
      this.assertEquals("4", this.__a.getItem(3), "append does not work");
      this.assertEquals("5", this.__a.getItem(4), "append does not work");
      dArray.dispose();

      // check if qx arrays work
      dArray = new qx.data.Array(["sechs"]);
      this.__a.append(dArray);
      this.assertEquals("sechs", this.__a.getItem(5), "append does not work");
      dArray.dispose();
    },


    testRemove: function() {
      this.__a.remove("two");

      // check the value
      this.assertEquals("one", this.__a.getItem(0), "removeAt does not work");
      this.assertEquals("three", this.__a.getItem(1), "removeAt does not work");
    },


    testEquals: function() {
      var a = new qx.data.Array("one", "two", "three");

      this.assertTrue(this.__a.equals(a), "equals does not work.");

      a.dispose();
    },


    testSum: function() {
      var a = new qx.data.Array(1, 2, 3);

      this.assertEquals(6, a.sum(), "sum does not work.");

      a.dispose();
    },


    testMax: function() {
      var a = new qx.data.Array(1, 2, 3);

      this.assertEquals(3, a.max(), "max does not work.");

      a.dispose();
    },


    testMin: function() {
      var a = new qx.data.Array(1, 2, -3);

      this.assertEquals(-3, a.min(), "min does not work.");

      a.dispose();
    },


    testPopEvent: function() {
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.pop();
      }, function(e) {
        self.assertEquals(1, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(1, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("remove", e.getData().type, "Wrong type in the event.");
        self.assertEquals(3, e.getData().items[0], "Wrong removed array in the event.");
      }, "Change event not fired!");
      a.dispose();
    },

    testPushEvent: function() {
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.push(4);
      }, function(e) {
        self.assertEquals(3, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(3, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("add", e.getData().type, "Wrong type in the event.");
        self.assertEquals(4, e.getData().items[0], "Wrong item array in the event.");
      }, "Change event not fired!");
      a.dispose();
    },

    testAppendEvent: function() {
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.append([4, 5]);
      }, function(e) {
        self.assertEquals(3, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(4, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("add", e.getData().type, "Wrong type in the event.");
        self.assertEquals(4, e.getData().items[0], "Wrong item array in the event.");
        self.assertEquals(5, e.getData().items[1], "Wrong item array in the event.");
      }, "Change event not fired!");
      a.dispose();
    },

    testShiftEvent: function() {
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.shift();
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(1, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("remove", e.getData().type, "Wrong type in the event.");
        self.assertEquals(1, e.getData().items[0], "Wrong item in the event.");
      }, "Change event not fired!");
      a.dispose();
    },

    testUnshiftEvent: function() {
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.unshift(0);
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(3, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("add", e.getData().type, "Wrong type in the event.");
        self.assertEquals(0, e.getData().items[0], "Wrong item in the event.");
      }, "Change event not fired!");
      a.dispose();
    },

    testSpliceEvent: function() {
      // test for the event (remove)
      var a = new qx.data.Array(1, 2, 3);
      var self = this;
      this.assertEventFired(a, "change", function () {
        a.splice(1, 1).dispose();
      }, function(e) {
        self.assertEquals(1, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(1, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("remove", e.getData().type, "Wrong type in the event.");
        self.assertEquals(2, e.getData().items[0], "Wrong item in the event.");
      }, "Change event not fired!");
      a.dispose();

      // test for the event (add)
      a = new qx.data.Array(1, 2, 3);
      this.assertEventFired(a, "change", function () {
        a.splice(0, 0, "xyz").dispose();
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(3, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("add", e.getData().type, "Wrong type in the event.");
        self.assertEquals("xyz", e.getData().items[0], "Wrong items in the event.");
        self.assertEquals(1, e.getData().items.length, "Wrong amount of items in the event.");
      }, "Change event not fired!");
      a.dispose();
    },

    testSetItemEvent: function() {
      // test for the event
      var a = new qx.data.Array(1, 2, 3);
      var self = this;

      this.assertEventFired(a, "change", function () {
        a.setItem(0, 4);
      }, function(e) {
        self.assertEquals(0, e.getData().start, "Wrong start index in the event.");
        self.assertEquals(0, e.getData().end, "Wrong end index in the event.");
        self.assertEquals("add", e.getData().type, "Wrong type in the event.");
        self.assertEquals(4, e.getData().items[0], "Wrong item in the event.");
      }, "Change event not fired!");

      // set the same thing again and check if we get a second event
      this.assertEventNotFired(a, "change", function () {
        a.setItem(0, 4);
      }, "Change event fired!");
      a.dispose();
    },


    testForEach : function()
    {
      var self = this;
      var i = 0;
      var thisContext = {};
      var handlerCalled = false;

      var forEachHandler = function(item, index, array) {
        handlerCalled = true;
        // check for the context
        self.assertEquals(this, thisContext);
        // check the parameter
        self.assertEquals(i, index);
        self.assertEquals(self.__a, array);
        // check the tree items
        if (i == 0) {
          i++;
          self.assertEquals("one", item);
          return;
        } else if (i == 1) {
          i++
          self.assertEquals("two", item);
          return;
        } else if (i == 2) {
          i++;
          self.assertEquals("three", item);
          return;
        }
        // something went wrong!
        throw new Error("Wrong call in the handler.");
      }

      // invoke the forEach
      this.__a.forEach(forEachHandler, thisContext);

      // check if the handlers has been called
      this.assertTrue(handlerCalled);
    },


    testNotAutoDisposeItems : function() {
      var o = new qx.core.Object();
      this.__a.push(o);
      this.__a.dispose();
      this.assertFalse(o.isDisposed());
      o.dispose();
    },


    testAutoDisposeItems : function() {
      var o = new qx.core.Object();
      this.__a.push(o);
      this.__a.setAutoDisposeItems(true);
      this.__a.dispose();
      this.assertTrue(o.isDisposed());
    }
  }
});