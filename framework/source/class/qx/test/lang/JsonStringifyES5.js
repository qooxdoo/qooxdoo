/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
   ________________________________________________________________________

   This class contains code based on the following work:

    ECMAScript 5 Conformance Suite
    http://es5conform.codeplex.com/

    Copyright (c) 2009 Microsoft Corporation
    BSD licensed

************************************************************************ */

qx.Class.define("qx.test.lang.JsonStringifyES5",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      // we only test the internal JSON and not the built-in browser
      // functionality
      this.JSON = new qx.lang.JsonImpl();
    },

    // 15.12.3-11-1
    testStringifyUndefined : function() {
      this.assertEquals(undefined, this.JSON.stringify(undefined));
    },


    // 15.12.3-11-2
    "test: A JSON.stringify replacer function works is applied to a top level undefined value." : function() {
      this.assertEquals('"replacement"', this.JSON.stringify(undefined, function(k, v) { return "replacement" }));
    },


    // 15.12.3-11-3
    testStringifyString : function() {
      this.assertEquals('"a string"', this.JSON.stringify("a string"));
    },


    // 15.12.3-11-4
    testStringifyNumber : function() {
      this.assertEquals('123', this.JSON.stringify(123));
    },


    // 15.12.3-11-5
    testStringifyBoolean : function() {
      this.assertEquals("true", this.JSON.stringify(true));
      this.assertEquals("false", this.JSON.stringify(false));
    },


    // 15.12.3-11-6
    testStringifyNull : function() {
      this.assertEquals("null", this.JSON.stringify(null));
    },


    // 15.12.3-11-7
    testStringifyNumberObject : function() {
      this.assertEquals("42", this.JSON.stringify(new Number(42)));
    },


    // 15.12.3-11-8
    testStringifyStringObject : function() {
      this.assertEquals('"a string"', this.JSON.stringify(new String("a string")));
    },


    // 15.12.3-11-9
    testStringifyBooleanObject : function() {
      this.assertEquals('false', this.JSON.stringify(new Boolean(false)));
    },


    // 15.12.3-11-10
    "test: A JSON.stringify replacer function applied to a top level scalar value can return undefined." : function() {
      this.assertUndefined(this.JSON.stringify(42, function(k, v) { return undefined }));
    },


    // 15.12.3-11-11
    "test: A JSON.stringify replacer function applied to a top level Object can return undefined." : function() {
      this.assertUndefined(this.JSON.stringify({prop:1}, function(k, v) { return undefined }));
    },


    // 15.12.3-11-12
    "test: A JSON.stringify replacer function applied to a top level scalar can return an Array." : function() {
      this.assertEquals("[4,2]", this.JSON.stringify(42, function(k, v) { return v==42 ?[4,2]:v }));
    },


    // 15.12.3-11-13
    "test: A JSON.stringify replacer function applied to a top level scalar can return an Object." : function() {
      this.assertEquals('{"forty":2}', this.JSON.stringify(42, function(k, v) { return v==42 ? {forty:2}: v}));
    },


    // 15.12.3-11-14
    "testStringifyFunction" : function() {
      this.assertUndefined(this.JSON.stringify(function() {}));
    },


    // 15.12.3-11-15
    "test: Applying JSON.stringify with a replacer function to a function returns the replacer value." : function() {
      this.assertEquals('99', this.JSON.stringify(function() {}, function(k,v) {return 99}));
    },


    // 15.12.3-4-1
    "test: JSON.stringify ignores replacer aruguments that are not functions or arrays." : function() {
      this.assertEquals('[42]', this.JSON.stringify([42], {}));
    },


    // 15.12.3-5-a-i-1
    "test: JSON.stringify converts Number wrapper object space arguments to Number values." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, new Number(5)),
        this.JSON.stringify(obj, null, 5)
      );
    },


    // 15.12.3-5-b-i-1
    "test: JSON.stringify converts String wrapper object space aruguments to String values." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, new String('xxx')),
        this.JSON.stringify(obj, null, "xxx")
      );
    },


    // 15.12.3-6-a-1
    "test: JSON.stringify treats numeric space arguments greater than 10 the same as a  space argument of 10." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, 10),
        this.JSON.stringify(obj, null, 100)
      );
    },


    // 15.12.3-6-a-2
    "test: JSON.stringify truccates non-integer numeric space arguments to their integer part." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, 5.99999),
        this.JSON.stringify(obj, null, 5)
      );
    },


    // 15.12.3-6-b-1
    "test: JSON.stringify treats numeric space arguments less than 1 (0.999999) the same as emptry string space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, 0.9999999),
        this.JSON.stringify(obj)
      );
    },


    // 15.12.3-6-b-2
    "test: JSON.stringify treats numeric space arguments less than 1 (0) the same as emptry string space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, 0),
        this.JSON.stringify(obj)
      );
    },


    // 15.12.3-6-b-3
    "test: JSON.stringify treats numeric space arguments less than 1 (-5) the same as emptry string space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, -5),
        this.JSON.stringify(obj)
      );
    },


    // 15.12.3-6-b-4
    "test: JSON.stringify treats numeric space arguments (in the range 1..10) is equivalent to a string of spaces of that length." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      var fiveSpaces = '     ';
      //               '12345'

      this.assertEquals(
        this.JSON.stringify(obj, null, 5),
        this.JSON.stringify(obj, null, fiveSpaces)
      );
    },


    // 15.12.3-7-a-1
    "test: JSON.stringify only uses the first 10 characters of a string space arguments." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj, null, '0123456789xxxxxxxxx'),
        this.JSON.stringify(obj, null, '0123456789')
      );
    },


    // 15.12.3-8-a-1
    "test: JSON.stringify treats an empty string space argument the same as a missing space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj),
        this.JSON.stringify(obj, null, '')
      );
    },


    // 15.12.3-8-a-2
    "test: JSON.stringify treats an Boolean space argument the same as a missing space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj),
        this.JSON.stringify(obj, null, true)
      );
    },


    // 15.12.3-8-a-3
    "test: JSON.stringify treats an null space argument the same as a missing space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj),
        this.JSON.stringify(obj, null, null)
      );
    },


    // 15.12.3-8-a-4
    "test: JSON.stringify treats an Boolean wrapper space argument the same as a missing space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj),
        this.JSON.stringify(obj, null, new Boolean(true))
      );
    },


    // 15.12.3-8-a-5
    "test: JSON.stringify treats non-Number or String object space arguments the same as a missing space argument." : function()
    {
      var obj = {a1: {b1: [1,2,3,4], b2: {c1: 1, c2: 2}},a2: 'a2'};

      this.assertEquals(
        this.JSON.stringify(obj),
        this.JSON.stringify(obj, null, obj)
      );
    },


    // 15.12.3@2-2-b-i-1
    "test: JSON.stringify converts string wrapper objects returned from a toJSON call to literal strings." : function()
    {
      var obj = {
        prop:42,
        toJSON: function () {return 'fortytwo objects'}
      };
      this.assertEquals('["fortytwo objects"]', this.JSON.stringify([obj]));
    },


    // 15.12.3@2-2-b-i-2
    "test: JSON.stringify converts Number wrapper objects returned from a toJSON call to literal Number." : function()
    {
      var obj = {
        prop:42,
        toJSON: function () {return new Number(42)}
      };
      this.assertEquals('[42]', this.JSON.stringify([obj]));
    },


    // 15.12.3@2-2-b-i-3
    "test: JSON.stringify converts Boolean wrapper objects returned from a toJSON call to literal Boolean values." : function()
    {
      var obj = {
        prop:42,
        toJSON: function () {return new Boolean(true)}
      };
      this.assertEquals('[true]', this.JSON.stringify([obj]));
    },


    // 15.12.3@2-3-a-1
    "test: JSON.stringify converts string wrapper objects returned from replacer functions to literal strings." : function()
    {
      this.assertEquals(
        '["fortytwo"]',
        this.JSON.stringify([42], function(k,v) {return v===42? new String('fortytwo'):v})
      );
    },


    // 15.12.3@2-3-a-2
    "test: JSON.stringify converts Number wrapper objects returned from replacer functions to literal numbers." : function()
    {
      this.assertEquals(
        '[84]',
        this.JSON.stringify([42], function(k,v) {return v===42? new Number(84):v})
      );
    },


    // 15.12.3@2-3-a-3
    "test: JSON.stringify converts Boolean wrapper objects returned from replacer functions to literal numbers." : function()
    {
      this.assertEquals(
        '[false]',
        this.JSON.stringify([42], function(k,v) {return v===42? new Boolean(false):v})
      );
    },


    // 15.12.3@4-1-1 and 15.12.3@4-1-2
    "test: JSON.stringify a circular object throws a TypeError" : function()
    {
      var obj = {};
      obj.prop = obj;
      try {
        this.JSON.stringify(obj);
      } catch (e) {
        this.assertEquals('TypeError', e.name);
        return;
      }

      this.fail();
    },


    // 15.12.3@4-1-3
    "test: JSON.stringify an indirectly circular object throws an error" : function()
    {
      var obj = {p1: {p2: {}}};
      obj.p1.p2.prop = obj;
      try {
        this.JSON.stringify(obj);
      } catch (e) {
        this.assertEquals('TypeError', e.name);
        return;
      }

      this.fail();
    }
  }
});
