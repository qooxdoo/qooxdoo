/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("qx.test.bom.storage.WebStorageTestCase",
{
  type : "abstract",
  extend : qx.dev.unit.TestCase,

  members :
  {
    _storage: null,

    setUp : function() {
      this._storage = this._getStorage();
      this._storage.clear();
    },

    tearDown : function() {
      this._storage = null;
    },

    testItem: function() {
      this.assertNull(this._storage.getItem("key1"));

      this._storage.setItem("key1","value1");
      this.assertEquals("value1", this._storage.getItem("key1"));

      this._storage.removeItem("key1");
      this.assertNull(this._storage.getItem("key1"));

      this._storage.setItem("key2", [1,"a"]);
      this.assertArrayEquals([1,"a"], this._storage.getItem("key2"));

      this._storage.setItem("key2", {"a": 1, "b": "c"});
      this.assertMap({"a": 1, "b": "c"}, this._storage.getItem("key2"));

      //overriding
      this._storage.setItem("key2", 12);
      this.assertEquals(12, this._storage.getItem("key2"));
    },

    testGetKey: function() {
      // the order is unreliable, so just test that the getKey works
      this._storage.setItem("key1","value");
      this.assertNotEquals(-1, Object.keys(this._storage.getStorage()).indexOf("key1"));
    },

    testLength: function() {
      this.assertEquals(0, this._storage.getLength());

      for (var i=0; i<10; i++) {
        this._storage.setItem("key"+i,"value");
      }

      this.assertEquals(10, this._storage.getLength());
    },

    testClear: function() {
      for (var i=0; i<10; i++) {
        this._storage.setItem("key"+i,"value");
      }
      this.assertEquals(10, this._storage.getLength());
      this._storage.clear();
      this.assertEquals(0, this._storage.getLength());
    },

    testForEach: function() {
      var i;
      for (i=0; i<10; i++) {
        this._storage.setItem("key"+i,"value");
      }
      //don't rely on the order
      i = 0;
      this._storage.forEach(function(key, item) {
        this.assertEquals(this._storage.getItem(key), item);
        i++;
      }, this);
      this.assertEquals(10, i);
    }
  }
});
