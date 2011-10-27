/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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

    _checkFeature: function() {
    },

    _getStorage: function() {
    },

    setUp : function() {
      this._checkFeature();
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
      //the order is unreliable, so just test that the getKey works
      this._storage.setItem("key1","value");
      this.assertEquals("key1", this._storage.getKey(0));
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

    testIterate: function() {
      var i;
      for (i=0; i<10; i++) {
        this._storage.setItem("key"+i,"value");
      }
      //don't rely on the order
      i = 0;
      this._storage.iterate(function(key, item) {
        this.assertEquals(this._storage.getItem(key), item);
        i++;
      }, this);
      this.assertEquals(10, i);
    },

    testStorageEvent: function() {
      this.require(["mshtml", "firefox", "opera"]);
      //CHROME
      //the event is never fired in the same document
      //the event seems to be fired for others documents from the same domain
      //
      //FIREFOX
      //sessionStorage doesn't fire the event in the same document
      //localStorage fires the event in the same document
      //
      //NOTE: at this point maybe the best idea is to not base our storage event
      //on the native storage event
      //here's a test page where you can check the storage on diff browsers:
      //http://www.lysator.liu.se/~jhs/test/html5-storage-events.html
      this._storage.addListenerOnce("storage", function() {
        this.resume(function() {
          // ignore
        }, this);
      }, this);

      this._storage.setItem("key1", "affe");
      this.wait();
    }
  }
});
