/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.data.store.Offline",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MRequirements, qx.dev.unit.MMock],


  members :
  {
    __store : null,
    __testKey : "qx-unit-test",

    hasLocalStorage : function()
    {
      return qx.core.Environment.get("html.storage.local");
    },

    hasQxDebug : function()
    {
      return qx.core.Environment.get("qx.debug");
    },

    setUp : function() {
      this.require(["localStorage"]);
    },


    tearDown : function()
    {
      this.getSandbox().restore();

      if (this.__store) {
        this.__store.dispose();
      }
      // erase the data from the storages
      qx.bom.Storage.getLocal().removeItem(this.__testKey);
    },


    __initDefaultStore : function() {
      this.__store = new qx.data.store.Offline(this.__testKey, "local");
    },

    __createDefaultModel : function() {
      return qx.data.marshal.Json.createModel({a: "a"}, true);
    },



    testCreate : function() {
      this.require(["qxDebug"]);

      var store;
      this.assertException(function() {
        store = new qx.data.store.Offline();
      });

      // fallback for the storage is local
      store = new qx.data.store.Offline(this.__testKey);
      this.assertEquals(store._storage, qx.bom.Storage.getLocal());
      store.dispose();

      // assert no exception
      this.__initDefaultStore();
      this.assertEquals(this.__testKey, this.__store.getKey());
    },


    testCreateWithDelegate : function() {
      var del = {};
      var spy = this.spy(qx.data.marshal, "Json");
      var store = new qx.data.store.Offline(this.__testKey, "local", del);
      this.assertCalledWith(spy, del);

      store.dispose();
    },


    testCheckEmptyModel : function() {
      this.__initDefaultStore();
      this.assertNull(this.__store.getModel());

      var model = this.__createDefaultModel();
      this.__store.setModel(model);
      this.__store.setModel(null);

      this.wait(1000, function () {
        this.assertNull(this.__store.getModel());

        model.dispose();
      }.bind(this));
    },


    testSetModel : function() {
      this.__initDefaultStore();

      var model = this.__createDefaultModel();
      this.__store.setModel(model);
      this.wait(1000, function () {
        this.assertEquals("a", this.__store.getModel().getA());

        model.dispose();
      }.bind(this));
    },

    testSetModelDebounce: function () {
      this.__initDefaultStore();

      var storeModelCallback = this.spy(this.__store._storage, "setItem");
      var model = this.__createDefaultModel();
      this.__store.setModel(model);
      model.setA('b');
      model.setA('c');

      this.wait(1000, function() {
        this.assertCalledOnce(storeModelCallback);
      }, this);
    },


    testChangeModel : function() {
      this.__initDefaultStore();

      var model = this.__createDefaultModel();
      this.__store.setModel(model);

      this.wait(1000, function () {
        this.assertEquals("a", this.__store.getModel().getA());

        model.setA("A");
        this.assertEquals("A", this.__store.getModel().getA());

        model.dispose();
      }.bind(this));
    },


    testModelWriteRead : function() {
      this.__initDefaultStore();

      var model = this.__createDefaultModel();
      this.__store.setModel(model);

      this.wait(1000, function () {
        this.assertEquals("a", this.__store.getModel().getA());

        // dispose the store to test the load of the model
        this.__store.dispose();
        model.dispose();

        this.__initDefaultStore();
        this.assertNotNull(this.__store.getModel());
        this.assertEquals("a", this.__store.getModel().getA());
      }.bind(this));
    },


    testModelRead : function() {
      this.stub(qx.bom.Storage.getLocal(), "getItem").returns({b : "b"});
      this.__initDefaultStore();

      this.assertNotUndefined(this.__store.getModel());
      this.assertFunction(this.__store.getModel().getB);
      this.assertEquals("b", this.__store.getModel().getB());
    },


    testUpdateModel : function() {
      this.__initDefaultStore();

      var model = this.__createDefaultModel();
      this.__store.setModel(model);

      this.wait(1000, function () {
        this.assertEquals("a", this.__store.getModel().getA());

        // dispose the store to test the load of the model
        this.__store.dispose();
        model.dispose();

        this.__initDefaultStore();
        this.assertNotNull(this.__store.getModel());
        this.__store.getModel().setA("b");

        this.wait(1000, function () {
          this.assertEquals("b", this.__store.getModel().getA(), "1");

          // dispose the store to test the load of the model
          this.__store.dispose();

          this.__initDefaultStore();
          this.assertNotNull(this.__store.getModel());
          this.assertEquals("b", this.__store.getModel().getA(), "2");
        }.bind(this));
      }.bind(this));
    },


    testReplaceModel : function() {
      this.__initDefaultStore();

      var model1 = this.__createDefaultModel();
      this.__store.setModel(model1);

      var model2 = qx.data.marshal.Json.createModel({x: "x"}, true);
      this.__store.setModel(model2);

      this.wait(1000, function () {
        this.__initDefaultStore();
        this.assertNotNull(this.__store.getModel());
        this.assertFunction(this.__store.getModel().getX);
        this.assertEquals("x", this.__store.getModel().getX());

        // get rid of all the created stuff
        this.__store.dispose();
        model1.dispose();
        model2.dispose();
      }.bind(this));
    },


    testBigModel : function() {
      var data = {a: [{b: 1, C: true}, 12.567, "a"]};
      var model = qx.data.marshal.Json.createModel(data, true);

      this.__initDefaultStore();

      this.__store.setModel(model);

      this.wait(1000, function () {
        this.assertEquals(1, this.__store.getModel().getA().getItem(0).getB());
        this.assertEquals(true, this.__store.getModel().getA().getItem(0).getC());
        this.assertEquals("a", this.__store.getModel().getA().getItem(2));

        model.dispose();
      }.bind(this));
    }
  }
});