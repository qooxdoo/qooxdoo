/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.lang.String", {
  extend: qx.dev.unit.TestCase,
  include: [qx.dev.unit.MMock],

  members: {
    testString() {
      this.assertNotUndefined(qx.lang.String);
    },

    testCharacterTypes() {
      this.assertTrue(qx.lang.String.isUpperCase("A"));
      this.assertTrue(qx.lang.String.isUpperCase("S"));
      this.assertTrue(qx.lang.String.isUpperCase("X"));
      this.assertTrue(qx.lang.String.isLowerCase("b"));
      this.assertTrue(qx.lang.String.isLowerCase("t"));
      this.assertTrue(qx.lang.String.isLowerCase("z"));
      this.assertTrue(qx.lang.String.isDigits("1"));
      this.assertTrue(qx.lang.String.isDigits("4"));
      this.assertTrue(qx.lang.String.isDigits("9"));

      this.assertTrue(!qx.lang.String.isLowerCase("A"));
      this.assertTrue(!qx.lang.String.isLowerCase("S"));
      this.assertTrue(!qx.lang.String.isLowerCase("X"));
      this.assertTrue(!qx.lang.String.isLowerCase("4"));
      this.assertTrue(!qx.lang.String.isUpperCase("b"));
      this.assertTrue(!qx.lang.String.isUpperCase("t"));
      this.assertTrue(!qx.lang.String.isUpperCase("z"));
      this.assertTrue(!qx.lang.String.isUpperCase("3"));
      this.assertTrue(!qx.lang.String.isLowerCase("2"));
      this.assertTrue(!qx.lang.String.isUpperCase("5"));

      this.assertTrue(qx.lang.String.isLetters("A"));
      this.assertTrue(qx.lang.String.isLetters("s"));
      this.assertTrue(!qx.lang.String.isLetters("9"));
    },

    testFormat() {
      this.assertNotUndefined(qx.lang.String.format);
      var Str = qx.lang.String;

      this.assertEquals("1-2", Str.format("%1-%2", [1, 2]));
      this.assertEquals("2-1", Str.format("%2-%1", [1, 2]));

      this.assertEquals("1-2", Str.format("%1-%2", ["1", "2"]));
      this.assertEquals("2-1", Str.format("%2-%1", ["1", "2"]));
      this.assertEquals(
        "1-2-3-4-5-6-7-8-9-10-11",
        Str.format("%1-%2-%3-%4-%5-%6-%7-%8-%9-%10-%11", [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11"
        ])
      );

      // test .replace() short hands: http://bclary.com/2004/11/07/#a-15.5.4.11
      this.assertEquals("foo $& bar", Str.format("foo %1 bar", ["$&"]));
      this.assertEquals("foo $` bar", Str.format("foo %1 bar", ["$`"]));
      this.assertEquals("foo $' bar", Str.format("foo %1 bar", ["$'"]));
      this.assertEquals("foo $1 bar", Str.format("foo %1 bar", ["$1"]));
      this.assertEquals("foo $22 bar", Str.format("foo %1 bar", ["$22"]));

      this.assertEquals(
        "foo $& bar $&",
        Str.format("foo %1 bar %2", ["$&", "$&"])
      );
    },

    testRepeat() {
      this.assertEquals("", qx.lang.String.repeat("", 10));
      this.assertEquals("", qx.lang.String.repeat("1", 0));
      this.assertEquals("1111", qx.lang.String.repeat("1", 4));
      this.assertEquals("123123123", qx.lang.String.repeat("123", 3));
      this.assertEquals("üüüü", qx.lang.String.repeat("ü", 4));
    },

    testPad() {
      this.assertNotUndefined(qx.lang.String.pad);
      var Str = qx.lang.String;

      this.assertEquals("------", Str.pad("", 6, "-"));

      this.assertEquals("---123", Str.pad("123", 6, "-"));
      this.assertEquals("----123", Str.pad("123", 7, "-"));
      this.assertEquals("    123", Str.pad("123", 7, " "));
      this.assertEquals("0000123", Str.pad("123", 7));

      this.assertEquals("123", Str.pad("123", 2, "-"));
      this.assertEquals("123", Str.pad("123", 3, "-"));
    },

    testAppend() {
      this.assertNotUndefined(qx.lang.Array.append);
      var a = [1, 2, 3];
      qx.lang.Array.append(a, [4, 5, 6]);

      this.assertJsonEquals(a, [1, 2, 3, 4, 5, 6]);

      var error = false;

      try {
        qx.lang.Array.append(a, 1);
      } catch (ex) {
        error = true;
      }

      this.assert(error);
    },

    testStartsWith() {
      var String = qx.lang.String;

      this.assertTrue(String.startsWith("123", "1"));
      this.assertTrue(String.startsWith("123", "123"));
      this.assertTrue(String.startsWith("1231", "1"));
      this.assertFalse(String.startsWith("123", "3"));
      this.assertFalse(String.startsWith("123", "4"));
    },

    testEscape() {
      // escape HTML
      this.assertEquals("\n", qx.bom.String.escape("\n"));

      this.assertEquals("Hello", qx.bom.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.bom.String.escape("juhu <>"));

      this.assertEquals(
        "&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;",
        qx.bom.String.escape("<div id='1'>&nbsp; €</div>")
      );

      this.assertEquals("&#127774; 1", qx.bom.String.escape("🌞 1"));

      // textToHtml
      this.assertEquals(
        "&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp; &euro;&lt;/div&gt;",
        qx.bom.String.fromText("<div id='1'>\n  &nbsp; €</div>")
      );

      // htmlToText
      this.assertEquals(
        "<div id='1'>\n \u00A0&nbsp; €</div>",
        qx.bom.String.toText(
          "&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp;  \n   &euro;&lt;/div&gt;"
        )
      );

      // unescape HTML
      this.assertEquals("\n", qx.bom.String.unescape("\n"));
      this.assertEquals("Hello", qx.bom.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.bom.String.unescape("juhu &lt;&gt;"));

      this.assertEquals(
        "<div id='1'>&nbsp; €</div>",
        qx.bom.String.unescape(
          "&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;"
        )
      );

      this.assertEquals("🌞 1", qx.bom.String.unescape("&#127774; 1"));

      this.assertEquals(">&zzzz;x", qx.bom.String.unescape("&gt;&zzzz;x"));

      this.assertEquals("€", qx.bom.String.unescape("&#x20AC;"));

      this.assertEquals("€", qx.bom.String.unescape("&#X20AC;"));

      // escape XML
      this.assertEquals("\n", qx.xml.String.escape("\n"));
      this.assertEquals("Hello", qx.xml.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.xml.String.escape("juhu <>"));

      this.assertEquals(
        "&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;",
        qx.xml.String.escape("<div id='1'>&nbsp; €</div>")
      );

      this.assertEquals(
        "&quot;bread&quot; &amp; &quot;butter&quot;",
        qx.xml.String.escape('"bread" & "butter"')
      );

      // unescape XML
      this.assertEquals("\n", qx.xml.String.unescape("\n"));
      this.assertEquals("Hello", qx.xml.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.xml.String.unescape("juhu &lt;&gt;"));

      this.assertEquals(
        "<div id='1'>&nbsp; €</div>",
        qx.xml.String.unescape(
          "&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;"
        )
      );

      this.assertEquals(
        '"bread" & "butter"',
        qx.xml.String.unescape("&quot;bread&quot; &amp; &quot;butter&quot;")
      );
    },

    testCapitalize() {
      this.assertEquals("Alibaba", qx.lang.String.capitalize("alibaba"));
      this.assertEquals("Über", qx.lang.String.capitalize("über"));
      this.assertEquals("Aüber", qx.lang.String.capitalize("aüber"));
      this.assertEquals("Die-Über", qx.lang.String.capitalize("die-über"));
      this.assertEquals("Die Über", qx.lang.String.capitalize("die über"));
    },

    testCamelCase() {
      qx.lang.String.hyphenate("padding-top");
      this.assertEquals("paddingTop", qx.lang.String.camelCase("padding-top"));
      this.assertEquals(
        "ILikeCookies",
        qx.lang.String.camelCase("I-like-cookies")
      );

      this.assertEquals(
        "iLikeCookies",
        qx.lang.String.camelCase("i-like-cookies")
      );
    },

    testHyphenate() {
      qx.lang.String.camelCase("paddingTop");
      this.assertEquals("padding-top", qx.lang.String.hyphenate("paddingTop"));
      this.assertEquals(
        "-i-like-cookies",
        qx.lang.String.hyphenate("ILikeCookies")
      );

      this.assertEquals(
        "i-like-cookies",
        qx.lang.String.hyphenate("iLikeCookies")
      );
    },

    // Check for bug #7234
    testCombineCamelCaseAndHyphenate() {
      qx.lang.String.hyphenate("padding-top");
      this.assertEquals("paddingTop", qx.lang.String.camelCase("padding-top"));

      qx.lang.String.camelCase("marginTop");
      this.assertEquals("margin-top", qx.lang.String.hyphenate("marginTop"));
    },

    testClean() {
      var str = "  a  b\tc\rd\fe\vf\n\ng\nh\ri ";
      var cleanStr = "a b c d e f g h i";
      // IE sees \v as "v"
      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        !(
          parseFloat(qx.core.Environment.get("engine.version")) >= 9 &&
          qx.core.Environment.get("browser.documentmode") >= 9
        )
      ) {
        cleanStr = "a b c d evf g h i";
      }
      this.assertEquals(cleanStr, qx.lang.String.clean(str));
    },

    testQuote() {
      this.assertEquals(
        '"abc \\"defg\\" hij"',
        qx.lang.String.quote('abc "defg" hij')
      );

      this.assertEquals(
        '"abc \\\\defg\\\\ hij"',
        qx.lang.String.quote("abc \\defg\\ hij")
      );

      this.assertEquals(
        '"abc \\"defg\\\\ hij"',
        qx.lang.String.quote('abc "defg\\ hij')
      );
    },

    testTrim() {
      var str = "     foo bar     ";

      this.assertIdentical(qx.lang.String.trimLeft(str), "foo bar     ");
      this.assertIdentical(qx.lang.String.trimRight(str), "     foo bar");
    },

    testCodePointAt() {
      this.assertEquals("abc".codePointAt(0), 97);
      this.assertEquals("abc".codePointAt(1), 98);
      this.assertEquals("abc".codePointAt(2), 99);
      this.assertEquals("abc".codePointAt(3), undefined);
      this.assertEquals("☃★♲".codePointAt(0), 9731);
      this.assertEquals("☃★♲".codePointAt(1), 9733);
      this.assertEquals("☃★♲".codePointAt(2), 9842);
      this.assertEquals("☃★♲".codePointAt(3), undefined);
    },

    testFromCodePoint() {
      this.assertEquals(String.fromCodePoint(42), "*");
      this.assertEquals(String.fromCodePoint(65, 90), "AZ");
      this.assertEquals(String.fromCodePoint(0x404), "Є");
      this.assertEquals(String.fromCodePoint(0x2f804), "\uD87E\uDC04");
      this.assertEquals(String.fromCodePoint(194564), "\uD87E\uDC04");
      this.assertEquals(
        String.fromCodePoint(0x1d306, 0x61, 0x1d307),
        "\uD834\uDF06a\uD834\uDF07"
      );

      this.assertEquals(String.fromCodePoint(9731, 9733, 9842), "☃★♲");
    },

    testStripScripts() {
      var str = "This is a <script>foobar</script>test";

      this.assertIdentical(qx.lang.String.stripScripts(str), "This is a test");

      var spy = this.spy(qx.lang.Function, "globalEval");

      str = "This is a test with<script>console.log('foobar');</script> script";

      this.assertIdentical(
        qx.lang.String.stripScripts(str, true),
        "This is a test with script"
      );

      this.assertCalledOnce(spy);

      spy.restore();
    }
  }
});
