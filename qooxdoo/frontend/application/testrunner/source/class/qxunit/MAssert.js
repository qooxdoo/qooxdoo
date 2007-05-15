/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Mixin.define("qxunit.MAssert", {

  members: {

    assertJsonEquals: function() {
      if (arguments.length == 3) {
        this.assertEquals(
          arguments[0],
          qx.io.Json.stringify(arguments[1]),
          qx.io.Json.stringify(arguments[2])
        );
      } else {
        this.assertEquals(
          qx.io.Json.stringify(arguments[0]),
          qx.io.Json.stringify(arguments[1])
        );
      }
    },

    assertMatch: function(str, re, msg) {
      this.__assert(str.search(re) >= 0 ? true : false, msg || "", "The String '"+str+"' does not match the regular expression '"+re.toString()+"'!");
    },

    assertException: function(callback, exception, re, msg) {
      var exception = exception || Error;
      var error;
      try {
        callback();
      } catch (e) {
        error = e;
      }
      if (error == null) {
        this.__assert(false, msg || "", "The function did not raise an exception!");
      }
      this.__assert(error instanceof exception, msg || "", "The raised exception does not have the expected type!");
      if (re) {
        this.assertMatch(error.toString(), re, msg);
      }
    },

    __assert: function(condition, comment, failMsg) {
      if (!condition) {
        throw new qxunit.AssertionError(comment, failMsg);
      }
    },

    assert: function(bool, msg) {
      this.__assert(bool == true, msg || "", "Called assert with 'false'");
    },

    fail: function(msg) {
      this.__assert(false, msg || "", "Called fail().");
    },

    assertTrue: function(bool, msg) {
      this.__assert(bool === true, msg || "", "Called assertTrue with 'false'");
    },

    assertFalse: function(bool, msg) {
      this.__assert(bool === false, msg || "", "Called assertFalse with 'true'");
    },

    assertEquals: function(expected, found, msg) {
      this.__assert(expected == found, msg || "", "Expected '"+expected+"' but found '"+found+"'!");
    },

    assertIdentical: function(expected, found, msg) {
      this.__assert(expected === found, msg || "", "Expected '"+expected+"' (identical) but found '"+found+"'!");
    },

    assertNotUndefined: function(value, msg) {
      this.__assert(value !== undefined, msg || "", "Expected value not to be undefined but found "+qx.io.Json.stringify(value)+"!");
    },

    assertUndefined: function(value, msg) {
      this.__assert(value === undefined, msg || "", "Expected value to be undefined but found "+qx.io.Json.stringify(value)+"!");
    },

    assertNotNull: function(value, msg) {
      this.__assert(value !== null, msg || "", "Expected value not to be null but found "+qx.io.Json.stringify(value)+"!");
    },

    assertNull: function(value, msg) {
      this.__assert(value === null, msg || "", "Expected value to be null but found "+qx.io.Json.stringify(value)+"!");
    },

    assertFunction: function(value, msg) {
      this.__assert(typeof value === "function", msg || "", "Expected value to be typeof function but found "+qx.io.Json.stringify(value)+"!");
    },

    assertString: function(value, msg) {
      this.__assert(typeof value === "string", msg || "", "Expected value to be typeof string but found "+qx.io.Json.stringify(value)+"!");
    },

    assertNumber: function(value, msg) {
      this.__assert(typeof value === "number", msg || "", "Expected value to be typeof number but found "+qx.io.Json.stringify(value)+"!");
    },

    assertObject: function(value, msg) {
      this.__assert(typeof value === "object" && value !== null, msg || "", "Expected value to be typeof object but found "+qx.io.Json.stringify(value)+"!");
    },

    assertArray: function(value, msg) {
      this.__assert(value instanceof Array, msg || "", "Expected value to be an array but found "+qx.io.Json.stringify(value)+"!");
    },

    assertMap: function(value, msg) {
      this.__assert(typeof value === "object" && !(value instanceof Array) && !(value instanceof qx.core.Object), msg || "", "Expected value to be a map but found "+qx.io.Json.stringify(value)+"!");
    },

    assertQxObject: function(value, msg) {
      this.__assert(value instanceof qx.core.Object, msg || "", "Expected value to be a qooxdoo object but found "+qx.io.Json.stringify(value)+"!");
    },

    assertQxWidget: function(value, msg) {
      this.__assert(value instanceof qx.ui.core.Widget, msg || "", "Expected value to be a qooxdoo widget but found "+qx.io.Json.stringify(value)+"!");
    },

    // assertions which are only evaluated if "qx.debug" if "on"
    assertJsonEqualsDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertJsonEquals.apply(this, arguments); },
      "off": function() {}
    }),
    assertMatchDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertMatch.apply(this, arguments); },
      "off": function() {}
    }),
    assertExceptionDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertException.apply(this, arguments); },
      "off": function() {}
    }),
    assertDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assert.apply(this, arguments); },
      "off": function() {}
    }),
    assertTrueDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertTrue.apply(this, arguments); },
      "off": function() {}
    }),
    assertEqualsDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertEquals.apply(this, arguments); },
      "off": function() {}
    }),
    assertNotUndefinedDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertNotUndefined.apply(this, arguments); },
      "off": function() {}
    }),
    assertUndefinedDebugOn:  qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertUndefined.apply(this, arguments); },
      "off": function() {}
    }),
    assertNotNullDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertNotNull.apply(this, arguments); },
      "off": function() {}
    }),
    assertNullDebugOn: qx.core.Variant.select("qx.debug", {
      "on": function() { this.assertNull.apply(this, arguments); },
      "off": function() {}
    })
  }

});