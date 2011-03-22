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

qx.Class.define("qx.test.data.store.Jsonp",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __store : null,

    setUp : function()
    {
      this.__store = new qx.data.store.Jsonp();
      this.__store.setCallbackParam("callback");
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


    isLocal : function() {
      return window.location.protocol == "file:";
    },


    needsPHPWarning : function() {
      this.warn("This test can only be run from a web server with PHP support.");
    },


    testWholePrimitive: function() {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          var model = this.__store.getModel();
          this.assertEquals("String", model.getString(), "The model is not created how it should!");
          this.assertEquals(12, model.getNumber(), "The model is not created how it should!");
          this.assertEquals(true, model.getBoolean(), "The model is not created how it should!");
          this.assertNull(model.getNull(), "The model is not created how it should!");
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/jsonp_primitive.php");
      var self = this;
      window.setTimeout(function(){
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testManipulatePrimitive: function() {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var manipulated = false;
      var delegate = {manipulateData : function(data) {
        manipulated = true;
        return data;
      }};

      this.__store.dispose();
      this.__store = new qx.data.store.Jsonp(null, delegate, "callback");

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          this.assertTrue(manipulated);
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/jsonp_primitive.php");
      var self = this;
      window.setTimeout(function() {
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },


    testConfigureRequestPrimitive: function() {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var configured = false;
      var self = this;
      var delegate = {configureRequest : function(request) {
        configured = true;
        self.assertTrue(request instanceof qx.io.ScriptLoader);
      }};
      this.__store.dispose();
      this.__store = new qx.data.store.Jsonp(null, delegate, "callback");

      this.__store.addListener("loaded", function() {
        this.resume(function() {
          this.assertTrue(configured);
        }, this);
      }, this);

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/jsonp_primitive.php");
      var self = this;
      window.setTimeout(function() {
        self.__store.setUrl(url);
      }, 100);

      this.wait();
    },

    testErrorEvent : function() {
      // do not test that for IE and Opera because of the missing
      // error handler for script tags
      if (
        !(qx.core.Environment.get("browser.name") == "ie") &&
        !(qx.core.Environment.get("browser.name") == "opera")
      ) {
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
  }
});