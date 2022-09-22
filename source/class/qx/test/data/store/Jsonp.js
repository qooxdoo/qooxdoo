/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 * @ignore(qx.data.model)
 *
 * @asset(qx/test/*)
 */

qx.Class.define("qx.test.data.store.Jsonp", {
  extend: qx.dev.unit.TestCase,

  include: [qx.dev.unit.MRequirements, qx.dev.unit.MMock],

  members: {
    __store: null,

    setUp() {
      this.require(["php"]);
      this.__store = new qx.data.store.Jsonp();

      this.url = qx.util.ResourceManager.getInstance().toUri(
        "qx/test/jsonp_primitive.php"
      );
    },

    tearDown() {
      this.getSandbox().restore();
      this.__store.dispose();

      if (this.request) {
        // From prototype
        delete this.request.dispose;

        // Dispose
        this.request.dispose();
      }

      // remove the former created classes
      qx.data.model = {};
      for (var name in qx.Class.$$registry) {
        if (name.search("qx.data.model") != -1) {
          delete qx.Class.$$registry[name];
        }
      }
    },

    isLocal() {
      return window.location.protocol == "file:";
    },

    setUpFakeRequest() {
      var req = (this.request = new qx.io.request.Jsonp());
      req.send = req.dispose = function () {};
      this.stub(qx.io.request, "Jsonp").returns(this.stub(req));
    },

    testSetCallbackParam() {
      this.setUpFakeRequest();

      var store = new qx.data.store.Jsonp();
      store.setCallbackParam("myCallback");
      store.setUrl("/url");

      this.assertCalledWith(this.request.setCallbackParam, "myCallback");
      store.dispose();
    },

    testSetCallbackName() {
      this.setUpFakeRequest();

      var store = new qx.data.store.Jsonp();
      store.setCallbackName("myCallback");
      store.setUrl("/url");

      this.assertCalledWith(this.request.setCallbackName, "myCallback");
      store.dispose();
    },

    testWholePrimitive() {
      this.__store.addListener("loaded", () => {
        this.resume(function () {
          var model = this.__store.getModel();
          this.assertEquals(
            "String",
            model.getString(),
            "The model is not created how it should!"
          );

          this.assertEquals(
            12,
            model.getNumber(),
            "The model is not created how it should!"
          );

          this.assertEquals(
            true,
            model.getBoolean(),
            "The model is not created how it should!"
          );

          this.assertNull(
            model.getNull(),
            "The model is not created how it should!"
          );
        }, this);
      });

      var url = this.url;
      this.__store.setUrl(url);

      this.wait();
    },

    testManipulatePrimitive() {
      var manipulated = false;
      var delegate = {
        manipulateData(data) {
          manipulated = true;
          return data;
        }
      };

      var store = new qx.data.store.Jsonp(null, delegate, "callback");

      store.addListener("loaded", () => {
        this.resume(function () {
          this.assertTrue(manipulated);
        }, this);
      });

      var url = this.url;
      store.setUrl(url);

      this.wait();
      store.dispose();
    },

    testConfigureRequestPrimitive() {
      var delegate,
        self = this;

      delegate = {
        configureRequest(request) {
          self.assertInstance(request, qx.io.request.Jsonp);
        }
      };

      this.spy(delegate, "configureRequest");

      var store = new qx.data.store.Jsonp(null, delegate, "callback");

      store.addListener("loaded", () => {
        this.resume(function () {
          this.assertCalled(delegate.configureRequest);
        }, this);
      });

      var url = this.url;
      store.setUrl(url);

      this.wait();
    },

    testDisposeRequest() {
      this.setUpFakeRequest();

      var store = new qx.data.store.Jsonp(this.url);
      store.dispose();

      this.assertCalled(this.request.dispose);
    },

    testDisposeRequestDone() {
      this.setUpFakeRequest();
      var url = this.url;
      this.__store.addListener("loaded", () => {
        this.resume(function () {
          this.__store.dispose();
          this.assertCalled(this.request.dispose);
        }, this);
      });

      this.__store.setUrl(url);
    },

    testErrorEvent() {
      // do not test that for IE and Opera because of the missing
      // error handler for script tags
      if (
        !(qx.core.Environment.get("browser.name") == "ie") &&
        !(qx.core.Environment.get("browser.name") == "opera")
      ) {
        this.__store.addListener("error", () => {
          this.resume(function () {}, this);
        });

        this.__store.setUrl("affe");

        this.wait();
      }
    }
  }
});
