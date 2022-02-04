/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * @ignore(qx.test.PROP, qx.test.Affe, qx.test.Gibbon)
 */
/**
 * Rudimentary tests to check that Sinon.JS is integrated correctly.
 *
 * Also serves as a collection of examples.
 */
qx.Class.define("qx.test.dev.unit.Sinon", {
  extend: qx.dev.unit.TestCase,

  include: [qx.dev.unit.MMock, qx.dev.unit.MRequirements],

  members: {
    sinon: null,

    /**
     * @ignore(qx.test.Animal)
     * @ignore(qx.test.Affe)
     * @ignore(qx.test.Gibbon)
     */
    setUp() {
      this.sinon = qx.dev.unit.Sinon.getSinon();

      qx.Class.define("qx.test.Animal", {
        extend: qx.core.Object,
        members: {
          getKind() {
            return "Animal";
          }
        }
      });

      qx.Class.define("qx.test.Affe", {
        extend: qx.test.Animal,
        members: {
          scratch() {
            return true;
          }
        }
      });

      qx.Class.define("qx.test.Gibbon", {
        extend: qx.test.Affe,
        members: {
          climb() {
            return true;
          }
        }
      });
    },

    "test: get sinon"() {
      var sinon = this.sinon;

      this.assertObject(sinon, "Sinon not found");
      this.assertFunction(sinon.spy, "No spy");
      this.assertFunction(sinon.stub, "No stub");
      this.assertFunction(sinon.mock, "No mock");
      this.assertFunction(sinon.useFakeTimers, "No fake timers");
      this.assertFunction(sinon.useFakeXMLHttpRequest, "No fake XHR");
    },

    "test: fail"() {
      var sinon = this.sinon;
      this.assertException(function () {
        sinon.fail();
      });
    },

    "test: spy"() {
      var spy = this.sinon.spy();
      spy();
      this.assertTrue(spy.called);
    },

    "test: spy conveniently"() {
      var spy = this.spy();
      spy();
      this.assertTrue(spy.called);
    },

    "test: stub"() {
      var whoami = this.sinon.stub();
      whoami.returns("Affe");

      this.assertEquals("Affe", whoami());
    },

    "test: stub conveniently"() {
      var whoami = this.stub();
      whoami.returns("Affe");

      this.assertEquals("Affe", whoami());
    },

    "test: stub property"() {
      qx.test.PROP = false;

      this.stub(qx.test, "PROP").value(true);
      this.assertEquals(true, qx.test.PROP);

      qx.test.PROP = undefined;
    },

    "test: stub property in isolation"() {
      qx.test.PROP = false;
      this.stub(qx.test, "PROP").value(true);
      this.assertEquals(true, qx.test.PROP);
      this.getSandbox().restore();
      this.assertEquals(false, qx.test.PROP);

      qx.test.PROP = undefined;
    },

    "test: stub environment setting"() {
      var setting = this.stub(qx.core.Environment, "get").withArgs(
        "browser.name"
      );

      setting.returns("My Browser");
      this.assertEquals("My Browser", qx.core.Environment.get("browser.name"));
    },

    "test: stub environment setting in isolation"() {
      var name = qx.core.Environment.get("browser.name"),
        version = qx.core.Environment.get("browser.version"),
        setting = this.stub(qx.core.Environment, "get").withArgs(
          "browser.name"
        );

      setting.returns("My Browser");
      this.getSandbox().restore();
      this.assertEquals(name, qx.core.Environment.get("browser.name"));
      this.assertEquals(version, qx.core.Environment.get("browser.version"));
    },

    "test: mock"() {
      var obj = { method() {} };
      var mock = this.sinon.mock(obj);
      mock.expects("method").once();

      obj.method();
      mock.verify();
    },

    "test: mock verify throws"() {
      var obj = { method() {} };
      var mock = this.sinon.mock(obj);
      mock.expects("method").once();

      this.assertException(function () {
        mock.verify();
      });
    },

    "test: mock unexpected use throws"() {
      var obj = { method() {} };
      var mock = this.sinon.mock(obj);
      mock.expects("method").never();

      this.assertException(
        function () {
          obj.method();
        },
        Error,
        /Unexpected call/
      );
    },

    "test: assert"() {
      var spy = this.sinon.spy();
      spy();
      this.assertCalled(spy);
    },

    "test: fake XHR"() {
      this.require(["xhr"]);

      this.useFakeXMLHttpRequest();
      var nxhr = window.XMLHttpRequest;
      new nxhr();
      var req = this.getRequests()[0];

      this.assertFunction(nxhr.restore, "restore");
      this.assertFunction(req.open, "open");
      this.assertFunction(req.send, "send");
    },

    "test: fake server"() {
      this.useFakeServer();
      var server = this.getServer();
      this.assertFunction(server.respond);
      this.assertFunction(server.respondWith);
    },

    "test: respond"() {
      this.require(["xhr"]);

      this.useFakeServer();
      var nxhr = window.XMLHttpRequest,
        req = new nxhr(),
        server = this.getServer();

      server.respondWith("GET", "found", [200, {}, "FOUND"]);
      req.open("GET", "found");
      req.send();
      server.respond();

      this.assertEquals(200, req.status);
      this.assertEquals("FOUND", req.responseText);
    },

    "test: respond with invalid XML"() {
      this.require(["xhr"]);

      this.useFakeXMLHttpRequest();
      var nxhr = window.XMLHttpRequest,
        req = new nxhr(),
        fakeReq = this.getRequests()[0];

      req.open();
      req.send();
      fakeReq.respond(200, { "Content-Type": "application/xml" }, "INVALID");
    },

    "test: sandbox and restore"() {
      var func = function () {};
      var obj = { a() {} };

      var spy = this.spy(func);
      var stub = this.stub(obj, "a");
      var xhr = this.useFakeXMLHttpRequest();
      var nxhr =
        window.XMLHttpRequest || window.ActiveXObject("Microsoft.XMLHTTP");

      this.getSandbox().restore();
      this.assertUndefined(func.called);
      this.assertUndefined(obj.a.called);
      this.assertUndefined(nxhr.restore);
    },

    "test: deep stub"() {
      var obj = new qx.test.Affe();
      obj = this.deepStub(obj);
      obj.getKind();
      this.assertCalled(obj.getKind);
      obj.dispose();
    },

    "test: shallow stub"() {
      var obj = new qx.test.Gibbon();
      obj = this.shallowStub(obj, qx.test.Affe);

      obj.climb();
      obj.scratch();
      this.assertCalled(obj.climb);
      this.assertCalled(obj.scratch);

      // Not stubbed
      this.assertEquals("Animal", obj.getKind(), "Must return original");
      this.assertUndefined(obj.getKind.called, "Must not be stubbed");
      obj.dispose();
    },

    "test: inject stub of original"() {
      this.injectStub(qx.test, "Affe");
      var affe = new qx.test.Affe();

      affe.scratch.returns(false);
      this.assertFalse(affe.scratch());
      affe.dispose();
    },

    "test: inject stub of original and return"() {
      var stub = this.injectStub(qx.test, "Affe"),
        affe = new qx.test.Affe();

      stub.scratch.returns(false);
      this.assertFalse(affe.scratch());
      affe.dispose();
    },

    "test: inject custom stub"() {
      this.injectStub(qx.test, "Affe", this.stub({ dance() {} }));
      var affe = new qx.test.Affe();

      affe.dance();
      this.assertCalled(affe.dance);
    },

    "test: inject custom stub and return"() {
      var stub = this.injectStub(qx.test, "Affe", this.stub({ dance() {} })),
        affe = new qx.test.Affe();

      affe.dance();
      this.assertCalled(stub.dance);
    },

    "test: reveal mock of original and return"() {
      var mock = this.revealMock(qx.test, "Affe"),
        affe = new qx.test.Affe();

      mock.expects("scratch").once();
      affe.scratch();
      mock.verify();
      affe.dispose();
    },

    "test: reveal mock of custom and return"() {
      var mock = this.revealMock(qx.test, "Affe", { dance() {} }),
        affe = new qx.test.Affe();

      mock.expects("dance").once();
      affe.dance();
      mock.verify();
    },

    hasXhr() {
      return qx.core.Environment.get("io.xhr") === "xhr";
    },

    tearDown() {
      this.getSandbox().restore();
      this.sinon = null;

      qx.Class.undefine("qx.test.Affe");
      qx.Class.undefine("qx.test.Animal");
      qx.Class.undefine("qx.test.Gibbon");
    }
  }
});
