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

/* ************************************************************************

#asset(qx/test/*)

************************************************************************ */

qx.Class.define("qx.test.data.store.Json",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __store : null,
    __data : null,
    __propertyNames : null,


    setUp : function()
    {
      this.__store = new qx.data.store.Json();

      this.__data = eval("({s: 'String', n: 12, b: true})");
      this.__propertyNames = ["s", "n", "b"];
    },


    tearDown : function()
    {
      this.__store.dispose();

      // remove the former created classes
      qx.data.model = {};
      for (var name in qx.Class.$$registry) {
        if (name.search("qx.data.model") != -1) {
          delete qx.Class.$$registry[name];
        }
      }
    },


    testWholePrimitive: function() {
      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertEquals("String", model.getString(), "The model is not created how it should!");
          this.assertEquals(12, model.getNumber(), "The model is not created how it should!");
          this.assertEquals(true, model.getBoolean(), "The model is not created how it should!");
          this.assertNull(model.getNull(), "The model is not created how it should!");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/primitive.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testWholeArray: function() {
      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertNotNull(model.getArray(), "The model is not created how it should!");
          this.assertEquals("qx.data.Array", model.getArray().classname, "Wrong array class.");
          this.assertEquals("a", model.getArray().getItem(0), "Wrong content of the array.");
          this.assertEquals("b", model.getArray().getItem(1), "Wrong content of the array.");
          this.assertEquals("c", model.getArray().getItem(2), "Wrong content of the array.");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/array.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);
      this.wait();
    },


    testWholeObject: function() {
      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertNotNull(model.getO(), "The model is not created how it should!");
          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");

        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);
      this.wait();
    },


    testOwnClassWith: function() {
      // define a test class
      qx.Class.define("qx.test.AB",
      {
        extend : qx.core.Object,

        properties :
        {
          a : {
            check : "String",
            event : "changeA"
          },

          b : {
            check : "String",
            event : "changeB"
          }
        }
      });

      var delegate = {
        getModelClass : function(properties) {
          if (properties == 'a"b') {
            return qx.Class.getByName("qx.test.AB");
          }
          return null;
        }
      };
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertNotNull(model.getO(), "The model is not created how it should!");

          this.assertEquals("qx.test.AB", model.getO().classname, "Not the given class used!");

          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");

        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testOwnClassWithout: function() {

      var delegate = {
        getModelClass : function(properties) {
          return null;
        }
      };
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertNotNull(model.getO(), "The model is not created how it should!");
          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");

        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);
      this.wait();
    },


    testOwnSuperclassWith: function() {
      // define a test class
      qx.Class.define("qx.test.O",
      {
        extend : qx.core.Object
      });

      var delegate = {
        getModelSuperClass : function(properties) {
          return qx.test.O;
        }
      };
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertTrue(qx.Class.isSubClassOf(model.constructor, qx.test.O));
          this.assertNotNull(model.getO(), "The model is not created how it should!");
          this.assertTrue(qx.Class.isSubClassOf(model.getO().constructor, qx.test.O));
          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testOwnSuperclassWithout: function() {
      // define a test class
      qx.Class.define("qx.test.O",
      {
        extend : qx.core.Object
      });

      var delegate = {
        getModelSuperClass : function(properties) {
          return null;
        }
      };
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertNotNull(model.getO(), "The model is not created how it should!");
          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testOwnMixinWithout: function() {
      var delegate = {
        getModelMixins : function(properties) {
          return null;
        }
      };
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertNotNull(model.getO(), "The model is not created how it should!");
          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testOwnMixinWith: function() {
      // define a test class
      qx.Mixin.define("qx.test.M",
      {
        members :
        {
          a: function() {
            return true;
          }
        }
      });

      var delegate = {
        getModelMixins : function(properties) {
          return qx.test.M;
        }
      };
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertTrue(model.a(), "Mixin not included.");
          this.assertNotNull(model.getO(), "The model is not created how it should!");
          this.assertTrue(model.getO().a(), "Mixin not included.");
          this.assertEquals("a", model.getO().getA(), "Wrong content of the object.");
          this.assertEquals("b", model.getO().getB(), "Wrong content of the object.");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/object.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testManipulatePrimitive: function() {
      var manipulated = false;
      var delegate = {manipulateData : function(data) {
        manipulated = true;
        return data;
      }};
      this.__store.dispose();
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          // check if the method has been called
          this.assertTrue(manipulated);
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/primitive.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testConfigureRequestPrimitive: function() {
      var configured = false;
      var self = this;
      var delegate = {configureRequest : function(request) {
        configured = true;
        self.assertTrue(request instanceof qx.io.remote.Request);
      }};
      this.__store.dispose();
      this.__store = new qx.data.store.Json(null, delegate);

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          // check if the method has been called
          this.assertTrue(configured);
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/primitive.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testDisposeOldModel: function(){
      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          // check if the new model is not the old model
          this.assertNotEquals(fakeModel, model);
          // check if the old model has been disposed
          this.assertTrue(fakeModel.isDisposed());
        }, this);
      }, this);

      // set a fake model
      var fakeModel = new qx.core.Object();
      this.__store.setModel(fakeModel);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/primitive.json");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testErrorEvent : function() {
      this.__store.addListener("error", function() {
        this.resume(function() {}, this);
      }, this);

      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl("affe");
      }, 100);

      this.wait();
    }
  }
});