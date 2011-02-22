/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
 *
 *       // Depending on the life cycle of the object you spied upon, this
 *       // may or may not be necessary. Restore the original method.
 *       // obj.restore();
 *     },
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
 * For full list of assertions see http://sinonjs.org/docs/api/#assertions.
 * Note that sinon.assert.xyz() translates as assertXyz().
 *
 */
qx.Mixin.define("qx.dev.unit.MMock",
{
  construct: function()
  {
    // Expose Sinon.JS assertions. Provides methods such
    // as assertCalled(), assertCalledWith().
    // (http://sinonjs.org/docs/api/#assert-expose)
    this.__getSinon().assert.expose(this, {includeFail: false});
  },

  members :
  {

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
    * A spy has a rich interface to introspect how the wrapped function was used:
    *
    * * spy.callCount
    * * spy.called
    * * spy.calledOnce
    * * spy.calledTwice
    * * spy.calledThrice
    * * spy.calledBefore(anotherSpy)
    * * spy.calledAfter(anotherSpy)
    * * spy.calledOn(obj)
    * * spy.alwaysCalledOn(obj)
    * * spy.calledWith(arg1, arg2, ...)
    * * spy.alwaysCalledWith(arg1, arg2, ...)
    * * spy.calledWithExactly(arg1, arg2, ...)
    * * spy.alwaysCalledWithExactly(arg1, arg2, ...)
    * * spy.threw()
    * * spy.threw("TypeError")
    * * spy.threw(obj)
    * * spy.alwaysThrew()
    * * spy.alwaysThrew("TypeError")
    * * spy.alwaysThrew(obj)
    * * spy.returned(obj)
    * * spy.alwaysReturned(obj)
    * * spy.getCall(n);
    * * spy.thisValues
    * * spy.args
    * * spy.exceptions
    * * spy.returnValues
    *
    * See http://sinonjs.org/docs/api/#spies.
    *
    * @param  function_or_object {Function?null|Object?null}
    *         Spies on the provided function or object.
    * @param  method {String?null}
    *         The method to spy upon if an object was given.
    * @return {Spy}
    *         The wrapped function enhanced with properties and
    *         methods that allow for introspection.
    */
    spy: function(function_or_object, method) {
      var sinon = this.__getSinon();
      return sinon.spy.apply(sinon, arguments);
    },

    /**
    * Test stubs are functions (spies) with pre-programmed behavior.
    *
    * * stub()
    *   Creates an anonymous stub function
    * * stub(object, "method")
    *   Replaces object.method with a stub function. The original function
    *   can be restored by calling object.method.restore() (or stub.restore()).
    *   An exception is thrown if the property is not already a function,
    *   to help avoid typos when stubbing methods.
    * * stub(obj)
    *   Stubs all the object's methods.
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
    * See http://sinonjs.org/docs/api/#stubs.
    *
    * @param  object {Object?null}
    *         Object to stub. Stubs all methods if no
    *         method is given.
    * @param  method {String?null}
    *         Replaces object.method with a stub function.
    *         An exception is thrown if the property is not already a
    *         function, to help avoid typos when stubbing methods.
    * @return {Stub}
    *         A stub. Has the interface of a spy in addition to methods
    *         that allow to define behaviour.
    *
    */
    stub: function(object, method) {
      var sinon = this.__getSinon();
      return sinon.stub.apply(sinon, arguments);
    },

    /**
    * Mocks are slightly different from spies and stubs in that you mock an
    * object, and then set an expectation on one or more of its objects.
    *
    * * var mock = mock(obj)
    *   Creates a mock for the provided object. Does not change the object, but
    *   returns a mock object to set expectations on the object's methods.
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
    * * expecation.verify();
    *
    * See http://sinonjs.org/docs/api/#mocks.
    *
    * @param object {Object}
    *        The object to create a mock of.
    * @return {Mock}
    *        A mock to set expectations on.
    */
    mock: function(object) {
      var sinon = this.__getSinon();
      return sinon.mock.apply(sinon, arguments);
    },
    
    /**
    * Replace the native XMLHttpRequest object in browsers that support it with
    * a custom implementation which does not send actual requests.
    * 
    * Note: You must not forget to call restore() in your TestCase tearDown or
    * equivalent to prevent your test from leaking.
    * 
    * See http://sinonjs.org/docs/api/#useFakeXMLHttpRequest.
    * 
    * @return {Xhr}
    */
    useFakeXMLHttpRequest: function() {
      var sinon = this.__getSinon();
      return sinon.useFakeXMLHttpRequest();
    }
  }
});
