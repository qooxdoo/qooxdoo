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

qx.Class.define("qx.test.lang.JsonParseES5",
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


    // 15.12.1.1-0-1
    "test: The JSON lexical grammer treats whitespace as a token seperator." : function()
    {
      try {
        this.JSON.parse('12\t\r\n 34'); // should produce a syntax error as whitespace results in two tokens
      } catch (e) {
        this.assert(e instanceof SyntaxError);
        return;
      }
      this.fail();
    },


    // 15.12.1.1-0-2 .. 15.12.1.1-0-8
    SKIP_testParseInvalidWhiteSpace : function()
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
          this.JSON.parse(strings[i]); // should produce a syntax error
        }
        catch (e) {
          continue;
        }
        this.fail();
      }
    },


    // 15.12.1.1-0-9
    testWhiteSpaceBeforeAndAfterTokens : function()
    {
      this.JSON.parse('\t\r \n{\t\r \n'+
          '"property"\t\r \n:\t\r \n{\t\r \n}\t\r \n,\t\r \n' +
          '"prop2"\t\r \n:\t\r \n'+
               '[\t\r \ntrue\t\r \n,\t\r \nnull\t\r \n,123.456\t\r \n]'+
            '\t\r \n}\t\r \n');  // should JOSN parse without error
    },


    // 15.12.1.1-g1-1 .. 15.12.1.1-g1-4
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
        this.assertEquals(1234, this.JSON.parse(space + "1234"));

        try {
          this.JSON.parse('12' + space + '34'); // should produce a syntax error as whitespace results in two tokens
        } catch (e) {
          continue;
        }
        this.fail();
      }
    },


    // 15.12.1.1-g2-1
    "test: JSONStrings can be written using double quotes." : function() {
      this.assertEquals("abc", this.JSON.parse('"abc"'));
    },


    // 15.12.1.1-g2-2
    "test: A JSONString may not be delimited by single quotes." : function()
    {
      try {
        this.JSON.parse("'abc'");
      } catch (e) {
        return;
      }
      this.fail();
    },


    // 15.12.1.1-g2-3
    "SKIP_test: A JSONString may not be delimited by Unicode escaped quotes." : function()
    {
      try {
        this.JSON.parse("\u0022abc\u0022");
      } catch (e) {
        return;
      }
      this.fail();
    },


    // 15.12.1.1-g2-4
    "test: A JSONString must both begin and end with double quotes." : function()
    {
      try {
        this.JSON.parse('"ab'+"c'")
      } catch (e) {
        return;
      }
      this.fail();
    },


    // 15.12.1.1-g2-5
    "test: A JSONStrings can contain no JSONStringCharacters (Empty JSONStrings)." : function() {
      this.assertEquals("", this.JSON.parse('""'))
    },


    // 15.12.1.1-g4-1 .. 15.12.1.1-g4-4
    "SKIP_test: The JSON lexical grammer does not allow a JSONStringCharacter to be any of the Unicode characters U+0000 thru U+001F." : function()
    {
      var chars = (
        "\u0000,\u0001,\u0002,\u0003,\u0004,\u0005,\u0006,\u0007," +
        "\u0008,\u0009,\u000a,\u000b,\u000c,\u000d,\u000e,\u000f," +
        "\u0010,\u0011,\u0012,\u0013,\u0014,\u0015,\u0016,\u0017," +
        "\u0018,\u0019,\u001a,\u001b,\u001c,\u001d,\u001e,\u001f"
      ).split(",");

      for (var i=0; i<chars.length; i++)
      {
        try {
          this.JSON.parse('"' + chars[i] + '"');
        } catch (e) {
          continue;
        }
        this.fail();
      }
    },


    // 15.12.1.1-g5-1
    "test: The JSON lexical grammer allows Unicode escape sequences in a JSONString." : function() {
      this.assertEquals("X", this.JSON.parse('"\\u0058"'));
    },


    // 15.12.1.1-g5-2
    "SKIP_test: A JSONStringCharacter UnicodeEscape may not have fewer than 4 hex characters." : function()
    {
      try {
        this.JSON.parse('"\\u005"')
      } catch (e) {
        this.assertEquals("SyntaxError", e.name);
      }
      this.fail();
    },


    // 15.12.1.1-g5-3
    "SKIP_test: A JSONStringCharacter UnicodeEscape may not include any non hex characters." : function()
    {
      try {
        this.JSON.parse('"\\u0X50"')
      } catch (e) {
        this.assertEquals("SyntaxError", e.name);
      }
      this.fail();
    },


    // 15.12.1.1-g6-1
    "test: The JSON lexical grammer allows '/' as a JSONEscapeCharacter after '\\' in a JSONString." : function() {
      this.assertEquals("/", this.JSON.parse('"\\/"'));
    },


    // 15.12.1.1-g6-2
    "test: The JSON lexical grammer allows '/' as a JSONEscapeCharacter after '\\' in a JSONString." : function() {
      this.assertEquals("\\", this.JSON.parse('"\\\\"'));
    },


    // 15.12.1.1-g6-3 .. 15.12.1.1-g6-7
    "test: The JSON lexical grammer allows 'b', 'f', 'n', 'r' and 't' as a JSONEscapeCharacter after '\\' in a JSONString." : function() {
      this.assertEquals("\b", this.JSON.parse('"\\b"'));
      this.assertEquals("\f", this.JSON.parse('"\\f"'));
      this.assertEquals("\n", this.JSON.parse('"\\n"'));
      this.assertEquals("\r", this.JSON.parse('"\\r"'));
      this.assertEquals("\t", this.JSON.parse('"\\t"'));
    }
  }
});
