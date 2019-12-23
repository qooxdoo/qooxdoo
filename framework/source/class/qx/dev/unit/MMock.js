/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */
/**
 *
 * Provides test spies, stubs and mocks as well as custom assertions.
 *
 * Here is a simple example:
 *
 * <pre class="javascript">
 *
 * // Test
 * qx&#046;Class.define("qx.test.Klass",
 * {
 *   extend : qx.dev.unit.TestCase,
 *
 *   include : qx.dev.unit.MMock,
 *
 *   members :
 *   {
 *     "test: doSpecial on condition xyz": function() {
 *       // Set-Up
 *       var obj = new qx.Klass();
 *
 *       // Wraps obj.doSpecial in a spy function and
 *       // replaces the original method with this spy.
 *       this.spy(obj, "doSpecial");
 *
 *       // Run code that is expected to fulfill condition
 *       obj.onCondition("xyz");
 *
 *       // Assert that spy was called
 *       this.assertCalled(obj.doSpecial);
 *     },
 *
 *     tearDown: function() {
 *       // Restore all stubs, spies and overridden host objects.
 *       //
 *       // It is a good idea to always run this in the <code>tearDown()</code>
 *       // method, especially when overwriting global or host objects.
 *       this.getSandbox().restore();
 *     }
 *   }
 * });
 *
 * // Implementation
 * qx&#046;Class.define("qx.Klass",
 * {
 *   extend : qx.core.Object,
 *
 *   members :
 *   {
 *     onCondition: function(condition) {
 *
 *       // Complex code determining mustDoSpecial
 *       // by examining condition passed
 *
 *       if (mustDoSpecial) {
 *         this.doSpecial();
 *       }
 *     },
 *
 *     doSpecial: function() {
 *
 *     }
 *   }
 * });
 *
 * </pre>
 *
 * This mixin provides assertions such as assertCalled() that work
 * with spies and stubs. Besides offering a compact way to express expectations,
 * those assertions have the advantage that meaningful error messages can be
 * generated.
 *
 * For full list of assertions see http://sinonjs.org/docs/#assertions.
 * Note that sinon.assert.xyz() translates as assertXyz().
 *
 */
qx.Mixin.define("qx.dev.unit.MMock",
{
  construct: function()
  {
    var sinon = this.__getSinon();
    this.__exposeAssertions();

    this.__sandbox = sinon.sandbox;
  },

  members :
  {

    __sandbox: null,

    __fakeXhr: null,

    /**
     * Expose Sinon.JS assertions. Provides methods such
     * as assertCalled(), assertCalledWith().
     * (http://sinonjs.org/docs/#assert-expose)
     * Does not override existing assertion methods.
     * @ignore(sinon.assert.expose)
     */
    __exposeAssertions : function() {
      var temp = {};
      sinon.assert.expose(temp, {includeFail: false});
      for (var method in temp) {
        if (!this[method]) {
          this[method] = temp[method];
        }
      }
    },

    /**
    * Get the Sinon.JS object.
    *
    * @return {Object}
    * @internal
    */
    __getSinon: function() {
      return qx.dev.unit.Sinon.getSinon();
    },

    /**
    * Test spies allow introspection on how a function is used
    * throughout the system under test.
    *
    * * spy()
    *   Creates an anonymous function that records arguments,
    *   this value, exceptions and return values for all calls.
    *
    * * spy(func)
    *   Spies on the provided function
    *
    * * spy(object, "method")
    *   Creates a spy for object.method and replaces the original method
    *   with the spy. The spy acts exactly like the original method in all cases.
    *   The original method can be restored by calling object.method.restore().
    *   The returned spy is the function object which replaced the original method.
    *   spy === object.method.
    *
    * * spy.withArgs(arg1[, arg2, ...])
    *   Creates a spy that only records calls when the received arguments matches those
    *   passed to <code>withArgs</code>.
    *
    * A spy has a rich interface to introspect how the wrapped function was used:
    *
    * * spy.withArgs(arg1[, arg2, ...]);
    * * spy.callCount
    * * spy.called
    * * spy.calledOnce
    * * spy.calledTwice
    * * spy.calledThrice
    * * spy.firstCall
    * * spy.secondCall
    * * spy.thirdCall
    * * spy.lastCall
    * * spy.calledBefore(anotherSpy)
    * * spy.calledAfter(anotherSpy)
    * * spy.calledOn(obj)
    * * spy.alwaysCalledOn(obj)
    * * spy.calledWith(arg1, arg2, ...)
    * * spy.alwaysCalledWith(arg1, arg2, ...)
    * * spy.calledWithExactly(arg1, arg2, ...)
    * * spy.alwaysCalledWithExactly(arg1, arg2, ...)
    * * spy.calledWithMatch(arg1, arg2, ...);
    * * spy.alwaysCalledWithMatch(arg1, arg2, ...);
    * * spy.calledWithNew();
    * * spy.neverCalledWith(arg1, arg2, ...);
    * * spy.neverCalledWithMatch(arg1, arg2, ...);
    * * spy.threw()
    * * spy.threw("TypeError")
    * * spy.threw(obj)
    * * spy.alwaysThrew()
    * * spy.alwaysThrew("TypeError")
    * * spy.alwaysThrew(obj)
    * * spy.returned(obj)
    * * spy.alwaysReturned(obj)
    * * spy.getCall(n)
    * * spy.thisValues
    * * spy.args
    * * spy.exceptions
    * * spy.returnValues
    * * spy.reset()
    * * spy.printf("format string", [arg1, arg2, ...])
    *
    * See http://sinonjs.org/docs/#spies.
    *
    * Note: Spies are transparently added to a sandbox. To restore
    * the original function for all spies run <code>this.getSandbox().restore()</code>
    * in your <code>tearDown()</code> method.
    *
    * @param function_or_object {Function|Object} Spies on the
    *   provided function or object.
    * @param method {String?null} The method to spy upon if an object was given.
    * @return {Function} The wrapped function enhanced with properties and methods
    *   that allow for introspection. See http://sinonjs.org/docs/#spies.
    */
    spy: function(function_or_object, method) {
      return this.__sandbox.spy.apply(this.__sandbox, arguments);
    },

    /**
    * Test stubs are functions (spies) with pre-programmed behavior.
    *
    * * stub()
    *   Creates an anonymous stub function
    *
    * * stub(object, "method")
    *   Replaces object.method with a stub function. The original function
    *   can be restored by calling object.method.restore() (or stub.restore()).
    *   An exception is thrown if the property is not already a function,
    *   to help avoid typos when stubbing methods.
    *
    * * stub(obj)
    *   Stubs all the object's methods.
    *
    * * stub.withArgs(arg1[, arg2, ...])
    *   Stubs the method only for the provided arguments. Can be used to create
    *   a stub that acts differently in response to different arguments.
    *
    * A stub has the interface of a spy in addition to methods that allow to define behaviour:
    *
    * * stub.returns(obj)
    * * stub.throws()
    * * stub.throws("TypeError")
    * * stub.throws(obj)
    * * stub.callsArg(index)
    * * stub.callsArg(0)
    * * stub.callsArgWith(index, arg1, arg2, ...)
    *
    * See http://sinonjs.org/docs/#stubs.
    *
    * Note: Stubs are transparently added to a sandbox. To restore
    * the original function for all stubs run <code>this.getSandbox().restore()</code>
    * in your <code>tearDown()</code> method.
    *
    * @param object {Object?null} Object to stub. Creates an anonymous stub function
    *   if not given.
    * @param  method {String?null} Replaces object.method with a stub function.
    *   An exception is thrown if the property is not already a function, to
    *   help avoid typos when stubbing methods.
    * @return {Function} A stub. Has the interface of a spy in addition to methods
    *   that allow to define behaviour. See http://sinonjs.org/docs/#stubs.
    *
    */
    stub: function(object, method) {
      return this.__sandbox.stub.apply(this.__sandbox, arguments);
    },

    /**
    * Mocks are slightly different from spies and stubs in that you mock an
    * object, and then set an expectation on one or more of its objects.
    *
    * * var mock = mock(obj)
    *   Creates a mock for the provided object. Does not change the object, but
    *   returns a mock object to set expectations on the object's methods.
    *
    * * var expectation = mock.expects("method")
    *   Overrides obj.method with a mock function and returns an expectation
    *   object. Expectations implement both the spy and stub interface plus
    *   the methods described below.
    *
    * Set expectations with following methods. All methods return the expectation
    * itself, meaning expectations can be chained.
    *
    * * expectation.atLeast(number);
    * * expectation.atMost(number);
    * * expectation.never();
    * * expectation.once();
    * * expectation.twice();
    * * expectation.thrice();
    * * expectation.exactly(number);
    * * expectation.withArgs(arg1, arg2, ...);
    * * expectation.withExactArgs(arg1, arg2, ...);
    * * expectation.on(obj);
    * * expectation.verify();
    *
    * See http://sinonjs.org/docs/#mocks.
    *
    * @param object {Object} The object to create a mock of.
    * @return {Function} A mock to set expectations on. See http://sinonjs.org/docs/#mocks.
    */
    mock: function(object) {
      var sinon = this.__getSinon();
      return sinon.mock.apply(sinon, arguments);
    },

    /**
    * Replace the native XMLHttpRequest object in browsers that support it with
    * a custom implementation which does not send actual requests.
    *
    * Note: The fake XHR is transparently added to a sandbox. To restore
    * the original host method run <code>this.getSandbox().restore()</code>
    * in your <code>tearDown()</code> method.
    *
    * See http://sinonjs.org/docs/#useFakeXMLHttpRequest.
    *
    * @return {Object}
    */
    useFakeXMLHttpRequest: function() {
      return this.__fakeXhr = this.__sandbox.useFakeXMLHttpRequest();
    },

    /**
    * Get requests made with faked XHR or server.
    *
    * Each request can be queried for url, method, requestHeaders,
    * status and more.
    *
    * See http://sinonjs.org/docs/#FakeXMLHttpRequest.
    *
    * @return {Array} Array of faked requests.
    */
    getRequests: function() {
      return this.__fakeXhr.requests;
    },

    /**
    * As {@link #useFakeXMLHttpRequest}, but additionally provides a high-level
    * API to setup server responses. To setup responses, use the server
    * returned by {@link #getServer}.
    *
    * See http://sinonjs.org/docs/#server.
    *
    * Note: The fake server is transparently added to a sandbox. To restore
    * the original host method run <code>this.getSandbox().restore()</code>
    * in your <code>tearDown()</code> method.
    *
    * @return {Object}
    */
    useFakeServer: function() {
      return this.__fakeXhr = this.__sandbox.useFakeServer();
    },

    /**
    * Get fake server created by {@link #useFakeServer}.
    *
    * @return {Object} Fake server.
    */
    getServer: function() {
      return this.__sandbox.server;
    },

    /**
    * Get sandbox.
    *
    * The sandbox holds all stubs and mocks. Run <code>this.getSandbox().restore()</code>
    * to restore all mock objects.
    *
    * @return {Object}
    *        Sandbox object.
    */
    getSandbox: function() {
      return this.__sandbox;
    },

    /**
     *
     * Returns a deep copied, API-identical stubbed out clone of the given
     * object.
     *
     * In contrast to the shallow {@link #stub}, also stubs out properties that
     * belong to the prototype chain.
     *
     * @param object {Object} Object to stub deeply.
     * @return {Object} A stub.
     */
    deepStub: function(object) {
      this.__getOwnProperties(object).forEach(function(prop) {
        this.__stubProperty(object, prop);
      }, this);

      return object;
    },

    /**
     *
     * Shallowly stub all methods (except excluded) that belong to classes found in inheritance
     * chain up to (but including) the given class.
     *
     * @param object {Object} Object to stub shallowly.
     * @param targetClazz {Object} Class which marks the end of the chain.
     * @param propsToExclude {Array} Array with properties which shouldn't be stubbed.
     * @return {Object} A stub.
     */
    shallowStub: function(object, targetClazz, propsToExclude) {
      this.__getOwnProperties(object, targetClazz).forEach(function(prop) {
        if (propsToExclude && propsToExclude.indexOf(prop) >= 0) {
          // don't stub excluded prop
          return;
        }
        this.__stubProperty(object, prop);
      }, this);

      return object;
    },

    /**
     *
     * Changes the given factory (e.g. a constructor) to return a stub. The
     * method itself returns this stub.
     *
     * By default, the stub returned by the changed factory is the object built
     * by the original factory, but deeply stubbed (see {@link #deepStub}).
     * Alternatively, a custom stub may be given explicitly that is used instead.
     *
     * @param object {Object} Namespace to hold factory, e.g. qx.html.
     * @param property {String} Property as string that functions as
     *  constructor, e.g. "Element".
     * @param customStub {Object?} Stub to inject.
     * @return {Object} Injected stub.
     */
    injectStub: function(object, property, customStub) {
      var stub = customStub || this.deepStub(new object[property]);

      this.stub(object, property).returns(stub);
      return stub;
    },

    /**
     * Changes the given factory (e.g. a constructor) to make a mock of the
     * object returned. The method itself returns this mock.
     *
     * By default, the object returned by the changed factory (that a mock is
     * made of) is a deep copied, API-identical clone of the object built by the
     * original factory. Alternatively, the object returned can be given
     * explicitly.
     *
     * @param object {Object} Namespace to hold factory, e.g. qx.html.
     * @param property {String} Property as string that functions as
     *  constructor, e.g. "Element".
     * @param customObject {Object?} Object to inject.
     * @return {Object} Mock of the object built.
     */
    revealMock: function(object, property, customObject) {
      var source = customObject ||
        this.__deepClone(new object[property]);

      this.stub(object, property).returns(source);
      return this.mock(source);
    },

    /**
     * Deep clone object by copying properties from prototype.
     *
     * @param obj {Object} Object to prepare (that is, clone).
     * @return {Object} Prepared (deeply cloned) object.
     */
    __deepClone: function(obj) {
      var clone = {};

      // Copy from prototype
      for (var prop in obj) {
        clone[prop] = obj[prop];
      }

      return clone;
    },

    /**
     * Get the object’s own properties.
     *
     * @param object {Object} Object to analyze.
     * @param targetClazz {Object} Class which marks the end of the chain.
     * @return {Array} Array of the object’s own properties.
     */
    __getOwnProperties: function(object, targetClazz) {
      var clazz = object.constructor,
          clazzes = [],
          properties = [];

      // Find classes in inheritance chain up to targetClazz
      if (targetClazz) {
        while(clazz.superclass) {
          clazzes.push(clazz);
          clazz = clazz.superclass;
          if (clazz == targetClazz.superclass) {
            break;
          }
        }
      }

      // Check if property is own in one of the classes in chain
      for (var prop in object) {

        if (clazzes.length) {
          var found = clazzes.some(function(clazz) {
            return clazz.prototype.hasOwnProperty(prop);
          });
          if (!found) {
            continue;
          }
        }

        properties.push(prop);
      }

      return properties;
    },

    /**
     * Safely stub property.
     *
     * @param object {Object} Object to stub.
     * @param prop {String} Property to stub.
     */
    __stubProperty: function(object, prop) {
      // Leave constructor and properties intact
      if(prop === "constructor" || typeof object[prop] !== "function") {
        return;
      }

      this.stub(object, prop);
    }
  }
});
