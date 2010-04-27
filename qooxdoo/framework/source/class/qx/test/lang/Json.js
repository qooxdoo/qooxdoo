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
      // we only test the internal JSON and not the built-in browser
      // functionality
      this.JSON = new qx.lang.JsonImpl();
    },


    testStringifyArray : function()
    {
      var text = this.JSON.stringify(['e', {pluribus: 'unum'}]);
      this.assertEquals('["e",{"pluribus":"unum"}]', text);
    },


    /**
     * Exposes Firefox bug #505228
     */
    testFormattingString : function()
    {
      var text = this.JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
      this.assertEquals('[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]', text); //json2
      //this.assertEquals('["e",\n\t{\n\t\t"pluribus":"unum"\n\t}\n]', text); // ff3.5
    },


    /**
     * Exposes Firefox bug #505228
     */
    testFormattingNumber : function()
    {
      var text = this.JSON.stringify(['e', {pluribus: 'unum'}], null, 2);
      this.assertEquals('[\n  "e",\n  {\n    "pluribus": "unum"\n  }\n]', text); //json2
      //this.assertEquals('["e",\n  {\n    "pluribus":"unum"\n  }\n]', text); // ff3.5
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
      var start = new Date(0);
      start.toJSON = function(key) {
        return this.getTime();
      };
      this.assertEquals('0', this.JSON.stringify(start));
    },


    /**
     * Exposes firefox bug #505238
     */
    testToJsonArguments : function()
    {
      var self = this;

      var custom = {}
      custom.toJSON = function(key)
      {
        self.assertEquals("", key);
        return "#" + key + "#";
      };
      this.assertEquals('"##"', this.JSON.stringify(custom));
    },


    testToJson : function()
    {
      var custom = {
        toJSON : function(key) {
          return "#" + key + "#";
        }
      };
      this.assertEquals('"##"', this.JSON.stringify(custom));
      this.assertEquals('{"juhu":"#juhu#"}', this.JSON.stringify({ juhu : custom }));
    },


    testStringifyRecursiveObject : function()
    {
      var obj = {};
      obj.foo = obj;

      this.assertException(function() {
        var text = this.JSON.stringify(obj);
      });

      var obj = [];
      obj[0] = obj;

      this.assertException(function() {
        var text = this.JSON.stringify(obj);
      });
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
      }
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


    testParseNumber : function() {
      this.assertEquals(1234, this.JSON.parse("1234"))
      this.assertEquals(1234, this.JSON.parse(" 1234"))
    }
  }
});
