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
 * Here is an example:
 *
 * <pre class="javascript">
 *
 * // Test
 * qx.Class.define("qx.test.Klass",
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
 *       // Spy on obj.doSpecial
 *       var spy = this.spy(obj, "doSpecial");
 *
 *       // Run code that is expected to fulfill condition
 *       obj.onCondition("xyz");
 *
 *       // Assert that spy was called
 *       this.assertCalled(spy);
 *     },
 *   }
 * });
 *
 * // Implementation
 * qx.Class.define("qx.Klass",
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
    this.__getSinon().assert.expose(this);
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
    * See http://sinonjs.org/docs/api/#spies.
    *
    * @return {Spy}
    */
    spy: function() {
      var sinon = this.__getSinon();
      return sinon.spy.apply(sinon, arguments);
    },

    /**
    * Test stubs are functions (spies) with pre-programmed behavior.
    *
    * See http://sinonjs.org/docs/api/#stubs.
    *
    * @return {Stub}
    */
    stub: function() {
      var sinon = this.__getSinon();
      return sinon.stub.apply(sinon, arguments);
    },

    /**
    * Mocks are slightly different from spies and stubs in that you mock an object,
    * and then set an expectation on one or more of its objects.
    *
    * See http://sinonjs.org/docs/api/#mocks.
    *
    * @return {Mock}
    */
    mock: function() {
      var sinon = this.__getSinon();
      return sinon.mock.apply(sinon, arguments);
    }
  }
});
