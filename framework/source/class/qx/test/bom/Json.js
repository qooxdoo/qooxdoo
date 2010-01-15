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

qx.Class.define("qx.test.bom.Json",
{
  extend : qx.dev.unit.TestCase,

  members :
  {   
    testStringifyArray : function()
    {
      var text = qx.bom.Json.stringify(['e', {pluribus: 'unum'}]);
      this.assertEquals('["e",{"pluribus":"unum"}]', text);
    },


    /**
     * Exposes Firefox bug #505228
     */
    testFormattingString : function()
    {
      var text = qx.bom.Json.stringify(['e', {pluribus: 'unum'}], null, '\t');
      this.assertEquals('[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]', text); //json2
      //this.assertEquals('["e",\n\t{\n\t\t"pluribus":"unum"\n\t}\n]', text); // ff3.5
    },


    /**
     * Exposes Firefox bug #505228
     */
    testFormattingNumber : function()
    {
      var text = qx.bom.Json.stringify(['e', {pluribus: 'unum'}], null, 2);
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

      var text = qx.bom.Json.stringify(json, replacer);
      this.assertEquals('["Date(0)","foo"]', text);
    },


    testReplacerWhiteList : function()
    {
      var list = ["name"];
      var text = qx.bom.Json.stringify({name: "Peter", last: "Pan"}, list);

      this.assertEquals('{"name":"Peter"}', text);
    },


    testStringifyObject : function() {
      this.assertEquals('{"test":123}', qx.bom.Json.stringify({ test : 123 }));
    },


    testStringifyDate : function()
    {
      var data = {
        start: new Date(0)
      };
      this.assertEquals('{"start":"1970-01-01T00:00:00.000Z"}', qx.bom.Json.stringify(data));
    },


    testCustomDateSerializer : function()
    {
      var start = new Date(0);
      start.toJSON = function(key) {
        return this.getTime();
      };
      this.assertEquals('0', qx.bom.Json.stringify(start));
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
      this.assertEquals('"##"', qx.bom.Json.stringify(custom));
    },


    testToJson : function()
    {
      var custom = {
        toJSON : function(key) {
          return "#" + key + "#";
        }
      };
      this.assertEquals('"##"', qx.bom.Json.stringify(custom));
      this.assertEquals('{"juhu":"#juhu#"}', qx.bom.Json.stringify({ juhu : custom }));
    },


    testStringifyRecursiveObject : function()
    {
      var obj = {};
      obj.foo = obj;

      this.assertException(function() {
        var text = qx.bom.Json.stringify(obj);
      });

      var obj = [];
      obj[0] = obj;

      this.assertException(function() {
        var text = qx.bom.Json.stringify(obj);
      });
    },


    testIgnoreNamedPropertiesInArrays : function()
    {
      var data = [1, "foo"];
      data.juhu = "kinners"; // must be ignored

      this.assertEquals('[1,"foo"]', qx.bom.Json.stringify(data));
    },


    testIgnoreFunction : function()
    {
      var data = {
        juhu: "kinners",
        foo: function() {}
      }
      this.assertEquals('{"juhu":"kinners"}', qx.bom.Json.stringify(data));
    },


    testSimpleParse : function()
    {
      var data = qx.bom.Json.parse('{"juhu":"kinners","age":23,"foo":[1,2,3]}');

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
      this.assertEquals(1234, qx.bom.Json.parse("1234"))
      this.assertEquals(1234, qx.bom.Json.parse(" 1234"))
    },
    
   
    // ES 15.12.1.1-0-1
    testParseWhitespaceAsTokenSeparator : function()
    {
      try {
        qx.bom.Json.parse('12\t\r\n 34'); // should produce a syntax error as whitespace results in two tokens
      } catch (e) {
        this.assert(e instanceof SyntaxError);
        return;
      }
      this.fail();
    },
    
    
    // ES 15.12.1.1-0-2 .. ES 15.12.1.1-0-8 
    testParseInvalidWhiteSpace : function() 
    {
      
      var strings = [
        '\u000b1234', // <VT> is not valid JSON whitespace as specified by the production JSONWhitespace.
        '\u000c1234', // <FF> is not valid JSON whitespace
        '\u00a01234', // <NBSP> is not valid JSON whitespace
        '\u200b1234', // <ZWSPP> is not valid JSON whitespace
        '\ufeff1234', // <BOM> is not valid JSON whitespace 
        '\u16801234',
        '\u180e1234',
        '\u20001234',
        '\u20011234',
        '\u20021234',
        '\u20031234',
        '\u20041234',
        '\u20051234',
        '\u20061234',
        '\u20071234',
        '\u20081234',
        '\u20091234',
        '\u200a1234',
        '\u202f1234',
        '\u205f1234',
        '\u30001234',
        '\u20281234', 
        '\u20291234'
      ]
      
      for  (var i=0; i<strings.length; i++)
      {
        try {
          qx.bom.Json.parse(strings[i]); // should produce a syntax error 
        }
        catch (e) {
          continue;
        }
        this.fail();
      }
    },
    
    
    // ES 15.12.1.1-0-9
    testWhiteSpaceBeforeAndAfterTokens : function()
    {
      qx.bom.Json.parse('\t\r \n{\t\r \n'+
          '"property"\t\r \n:\t\r \n{\t\r \n}\t\r \n,\t\r \n' +
          '"prop2"\t\r \n:\t\r \n'+
               '[\t\r \ntrue\t\r \n,\t\r \nnull\t\r \n,123.456\t\r \n]'+
            '\t\r \n}\t\r \n');  // should JOSN parse without error
    },
    
    
    // ES 15.12.1.1-g1-1 .. ES 15.12.1.1-g1-4
    testParseWhitespace : function()
    {
      var spaces = [
        "\t",
        "\r",
        "\n",
        " "
      ];
      
      for (var i=0; i<spaces.length; i++)
      {
        var space = spaces[i];
        this.assertEquals(1234, qx.bom.Json.parse(space + "1234"));
        
        try {
          qx.bom.Json.parse('12' + space + '34'); // should produce a syntax error as whitespace results in two tokens
        } catch (e) {
          continue;
        }
        this.fail();
      }
    }
  }
});
