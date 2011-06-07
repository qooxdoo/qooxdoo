/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.lang.Json",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      // Test either native (when available) or emulated JSON,
      // see [BUG #5037]
      this.JSON = qx.lang.Json;
    },


    testStringifyArray : function()
    {
      var text = this.JSON.stringify(['e', {pluribus: 'unum'}]);
      this.assertEquals('["e",{"pluribus":"unum"}]', text);
    },


    testFormattingString : function()
    {
      var str = this.JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
      var expected = /[\n\t"e",\n\t{\n\t\t"pluribus":\s?"unum"\n\t}\n]/;
      this.assertMatch(str, expected);
    },


    testFormattingNumber : function()
    {
      var str = this.JSON.stringify(['e', {pluribus: 'unum'}], null, 2);
      var expected = /[\n  "e",\n  {\n    "pluribus":\s"unum"\n  }\n]/;
      this.assertMatch(str, expected);
    },


    testReplacer : function()
    {
      var json = [new Date(0), "foo"];

      var self = this;
      var replacer = function(key, value) {
        return this[key] instanceof Date ? 'Date(' + this[key].getTime() + ')' : value;
      };

      var text = this.JSON.stringify(json, replacer);
      this.assertEquals('["Date(0)","foo"]', text);
    },


    testReplacerWhiteList : function()
    {
      var list = ["name"];
      var text = this.JSON.stringify({name: "Peter", last: "Pan"}, list);

      this.assertEquals('{"name":"Peter"}', text);
    },


    testStringifyObject : function() {
      this.assertEquals('{"test":123}', this.JSON.stringify({ test : 123 }));
    },


    testStringifyDate : function()
    {
      var data = {
        start: new Date(0)
      };
      this.assertMatch(
        this.JSON.stringify(data),
        new RegExp('\{"start":"1970\-01\-01T00:00:00\(\.0*)?Z"\}')
      );
    },


    testCustomDateSerializer : function()
    {
      var date = new Date(0);
      date.toJSON = function(key) {
        return this.valueOf();
      };

      var result = this.JSON.stringify(date);

      // Expected '0' but found '0'! in Opera
      // this.assertEquals("0", result);

      this.assert("0".charCodeAt() == result.charCodeAt());
    },


    testToJson : function()
    {
      var obj = {
        toJSON : function(key) {
          return "##";
        }
      };

      this.assertEquals('"##"', this.JSON.stringify(obj));
    },

    testToJsonKey : function()
    {
      // Known to fail in some browsers:
      //
      // Firefox: toJSON is passed no parameter, i.e. key is undefined
      //          undefined + "" is "undefined" in Firefox
      //
      // IE 8:    toJSON is passed the string "\u0082\u0000\u0000\u0000",
      //          which is the equivalent of "BREAK PERMITTED HERE" and two
      //          "NUL".
      //
      if (this.isFirefox() || this.isIe8()) {
        throw new qx.dev.unit.RequirementError();
      }

      var obj = {
        toJSON : function(key) {
          return "#" + key + "#";
        }
      };

      var str = this.JSON.stringify({ juhu : obj });
      this.assertMatch(str, /#juhu#/);
    },

    testStringifyRecursiveObject : function()
    {
      var obj = {};
      obj.foo = obj;

      this.assertException(function() {
        var text = this.JSON.stringify(obj);
      });

      obj = [];
      obj[0] = obj;

      this.assertException(function() {
        var text = this.JSON.stringify(obj);
      });
    },

    testStringifyLegacyDate : function()
    {
      var obj = { date: new Date(Date.UTC(2020,0,1,0,0,0,123)) };
      obj.date.toJSON = function() {
        var dateParams =
          this.getUTCFullYear() + "," +
          this.getUTCMonth() + "," +
          this.getUTCDate() + "," +
          this.getUTCHours() + "," +
          this.getUTCMinutes() + "," +
          this.getUTCSeconds() + "," +
          this.getUTCMilliseconds();
        return "new Date(Date.UTC(" + dateParams + "))";
      };

      var msg,
          result = this.JSON.stringify(obj);

      msg = "Must contain legacy date literal";
      this.assertMatch(result, /"new Date\(Date.UTC\(2020,0,1,0,0,0,123\)\)"/, msg);
    },

    testIgnoreNamedPropertiesInArrays : function()
    {
      var data = [1, "foo"];
      data.juhu = "kinners"; // must be ignored

      this.assertEquals('[1,"foo"]', this.JSON.stringify(data));
    },


    testIgnoreFunction : function()
    {
      var data = {
        juhu: "kinners",
        foo: function() {}
      };
      this.assertEquals('{"juhu":"kinners"}', this.JSON.stringify(data));
    },


    testSimpleParse : function()
    {
      var data = this.JSON.parse('{"juhu":"kinners","age":23,"foo":[1,2,3]}');

      // check keys
      this.assertEquals(
        ["juhu", "foo", "age"].sort().toString(),
        qx.lang.Object.getKeys(data).sort().toString()
      );

      // check values
      this.assertEquals("kinners", data.juhu);
      this.assertEquals(23, data.age);
      this.assertArrayEquals([1, 2, 3], data.foo);
    },


    testParseNumber : function()
    {
      this.assertEquals(1234, this.JSON.parse("1234"));
      this.assertEquals(1234, this.JSON.parse(" 1234"));
    },

    testParseLegacyDate : function()
    {
      var str = '{ "date": "new Date(Date.UTC(2020,0,1,0,0,0,123))" }';

      var obj = this.JSON.parse(str, function(key, value) {
        if (value && typeof value === "string") {
          if (value.indexOf("new Date(Date.UTC(") >= 0) {
            var m = value.match(/new Date\(Date.UTC\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)\)/);
            return new Date(Date.UTC(m[1],m[2],m[3],m[4],m[5],m[6],m[7]));
          }
        }
        return value;
      });

      var msg;

      msg = "Must be date";
      this.assertTrue(qx.lang.Type.isDate(obj.date), msg);

      msg = "Must be same milliseconds";
      this.assertEquals(new Date(Date.UTC(2020,0,1,0,0,0,123)).valueOf(),
        obj.date.valueOf(), msg);
    },

    isIe8 : function()
    {
      return qx.core.Environment.get("engine.name") === "mshtml" &&
             qx.core.Environment.get("engine.version") == 8;
    },

    isFirefox : function()
    {
      return qx.core.Environment.get("engine.name") === "gecko";
    }
  }
});
