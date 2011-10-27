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

qx.Class.define("qx.test.lang.String",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testString : function() {
      this.assertNotUndefined(qx.lang.String);
    },


    testFormat : function()
    {
      this.assertNotUndefined(qx.lang.String.format);
      var Str = qx.lang.String;

      this.assertEquals("1-2", Str.format("%1-%2", [ 1, 2 ]));
      this.assertEquals("2-1", Str.format("%2-%1", [ 1, 2 ]));

      this.assertEquals("1-2", Str.format("%1-%2", [ "1", "2" ]));
      this.assertEquals("2-1", Str.format("%2-%1", [ "1", "2" ]));
      this.assertEquals("1-2-3-4-5-6-7-8-9-10-11", Str.format("%1-%2-%3-%4-%5-%6-%7-%8-%9-%10-%11", [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]));
    },



    testRepeat: function()
    {
      this.assertEquals("", qx.lang.String.repeat("", 10));
      this.assertEquals("", qx.lang.String.repeat("1", 0));
      this.assertEquals("1111", qx.lang.String.repeat("1", 4));
      this.assertEquals("123123123", qx.lang.String.repeat("123", 3));
      this.assertEquals("üüüü", qx.lang.String.repeat("ü", 4));
    },


    testPad : function()
    {
      this.assertNotUndefined(qx.lang.String.pad);
      var Str = qx.lang.String;

      this.assertEquals("------", Str.pad("", 6, '-'));

      this.assertEquals("---123", Str.pad("123", 6, '-'));
      this.assertEquals("----123", Str.pad("123", 7, '-'));
      this.assertEquals("    123", Str.pad("123", 7, ' '));
      this.assertEquals("0000123", Str.pad("123", 7));

      this.assertEquals("123", Str.pad("123", 2, '-'));
      this.assertEquals("123", Str.pad("123", 3, '-'));
    },


    testAppend : function()
    {
      this.assertNotUndefined(qx.lang.Array.append);
      var a = [ 1, 2, 3 ];
      qx.lang.Array.append(a, [ 4, 5, 6 ]);

      this.assertJsonEquals(a, [ 1, 2, 3, 4, 5, 6 ]);

      var error = false;

      try {
        qx.lang.Array.append(a, 1);
      } catch(ex) {
        error = true;
      }

      this.assert(error);
    },


    testStartsWith : function()
    {
      var String = qx.lang.String;

      this.assertTrue(String.startsWith("123", "1"));
      this.assertTrue(String.startsWith("123", "123"));
      this.assertTrue(String.startsWith("1231", "1"));
      this.assertFalse(String.startsWith("123", "3"));
      this.assertFalse(String.startsWith("123", "4"));
    },


    testEscape : function()
    {
      // escape HTML
      this.assertEquals("\n", qx.bom.String.escape("\n"));

      this.assertEquals("Hello", qx.bom.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.bom.String.escape("juhu <>"));

      this.assertEquals("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;", qx.bom.String.escape("<div id='1'>&nbsp; €</div>"));

      // textToHtml
      this.assertEquals("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp; &euro;&lt;/div&gt;", qx.bom.String.fromText("<div id='1'>\n  &nbsp; €</div>"));

      // htmlToText
      this.assertEquals("<div id='1'>\n \u00A0&nbsp; €</div>", qx.bom.String.toText("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp;  \n   &euro;&lt;/div&gt;"));

      // unescape HTML
      this.assertEquals("\n", qx.bom.String.unescape("\n"));
      this.assertEquals("Hello", qx.bom.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.bom.String.unescape("juhu &lt;&gt;"));

      this.assertEquals("<div id='1'>&nbsp; €</div>", qx.bom.String.unescape("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;"));

      this.assertEquals(">&zzzz;x", qx.bom.String.unescape("&gt;&zzzz;x"));

      this.assertEquals("€", qx.bom.String.unescape("&#x20AC;"));

      this.assertEquals("€", qx.bom.String.unescape("&#X20AC;"));

      // escape XML
      this.assertEquals("\n", qx.xml.String.escape("\n"));
      this.assertEquals("Hello", qx.xml.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.xml.String.escape("juhu <>"));

      this.assertEquals("&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;", qx.xml.String.escape("<div id='1'>&nbsp; €</div>"));

      this.assertEquals("&quot;bread&quot; &amp; &quot;butter&quot;", qx.xml.String.escape('"bread" & "butter"'));

      // unescape XML
      this.assertEquals("\n", qx.xml.String.unescape("\n"));
      this.assertEquals("Hello", qx.xml.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.xml.String.unescape("juhu &lt;&gt;"));

      this.assertEquals("<div id='1'>&nbsp; €</div>", qx.xml.String.unescape("&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;"));

      this.assertEquals('"bread" & "butter"', qx.xml.String.unescape("&quot;bread&quot; &amp; &quot;butter&quot;"));
    },

    testCapitalize : function()
    {
      this.assertEquals("Alibaba", qx.lang.String.capitalize("alibaba"));
      this.assertEquals("Über", qx.lang.String.capitalize("über"));
      this.assertEquals("Aüber", qx.lang.String.capitalize("aüber"));
      this.assertEquals("Die-Über", qx.lang.String.capitalize("die-über"));
      this.assertEquals("Die Über", qx.lang.String.capitalize("die über"));
    },

    testCamelCase : function()
    {
      this.assertEquals("paddingTop", qx.lang.String.camelCase("padding-top"));
      this.assertEquals("ILikeCookies", qx.lang.String.camelCase("I-like-cookies"));
      this.assertEquals("iLikeCookies", qx.lang.String.camelCase("i-like-cookies"));
    },

    testHyphenate : function()
    {
      this.assertEquals("padding-top", qx.lang.String.hyphenate("paddingTop"));
      this.assertEquals("-i-like-cookies", qx.lang.String.hyphenate("ILikeCookies"));
      this.assertEquals("i-like-cookies", qx.lang.String.hyphenate("iLikeCookies"));
    },

    testClean: function()
    {
      var str = "  a  b\tc\rd\fe\vf\n\ng\nh\ri ";
      var cleanStr = "a b c d e f g h i";
      // IE sees \v as "v"
      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        !(parseFloat(qx.core.Environment.get("engine.version")) >= 9 &&
        qx.core.Environment.get("browser.documentmode") >= 9)
      ) {
        cleanStr = "a b c d evf g h i";
      }
      this.assertEquals(cleanStr, qx.lang.String.clean(str));
    }
  }
});
