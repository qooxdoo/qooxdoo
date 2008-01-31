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

qx.Class.define("testrunner.test.Lang",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * string tests
     *
     * @type member
     * @return {void}
     */
    testString : function() {
      this.assertNotUndefined(qx.lang.String);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testFormat : function()
    {
      this.assertNotUndefined(qx.lang.String.format);
      var Str = qx.lang.String;

      this.assertEquals("1-2", Str.format("%1-%2", [ 1, 2 ]));
      this.assertEquals("2-1", Str.format("%2-%1", [ 1, 2 ]));

      this.assertEquals("1-2", Str.format("%1-%2", [ "1", "2" ]));
      this.assertEquals("2-1", Str.format("%2-%1", [ "1", "2" ]));
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testAddRemovelistItem : function()
    {
      this.assertNotUndefined(qx.lang.String.pad);
      var Str = qx.lang.String;

      this.assertEquals("a", Str.addListItem("a", "a", ", "));
      this.assertEquals("a", Str.addListItem("", "a", ", "));

      this.assertEquals("a, b", Str.addListItem("a", "b", ", "));
      this.assertEquals("a, b", Str.addListItem("a, b", "b", ", "));

      this.assertEquals("a,b", Str.addListItem("a", "b"));
      this.assertEquals("a,b", Str.addListItem("a,b", "b"));

      this.assertEquals("a,b", Str.removeListItem("a,b,c", "c"));
      this.assertEquals("a,b", Str.removeListItem("a,c,b", "c"));
      this.assertEquals("a,b", Str.removeListItem("c,a,b", "c"));

      this.assertEquals("a, b", Str.removeListItem("a, b, c", "c", ", "));
      this.assertEquals("a, b", Str.removeListItem("a, c, b", "c", ", "));
      this.assertEquals("a, b", Str.removeListItem("c, a, b", "c", ", "));

      this.assertEquals("a, b", Str.removeListItem("a, b", "c", ", "));

      this.assertEquals("", Str.removeListItem("", "c"));
    },


    /**
     * Array tests
     *
     * @type member
     * @return {void}
     */
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


    /**
     * Object tests
     *
     * @type member
     * @return {void}
     */
    testObject : function() {
      this.assertNotUndefined(qx.lang.Object);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testInvert : function()
    {
      this.assertNotUndefined(qx.lang.Object.invert);
      var Obj = qx.lang.Object;

      this.assertJsonEquals(
      {
        a   : "1",
        "2" : "b"
      },
      Obj.invert(
      {
        1 : "a",
        b : 2
      }));
    },


    /**
     * StringEscape tests
     *
     * @type member
     * @return {void}
     */
    testEscape : function()
    {
      // escape HTML
      this.assertEquals("\n", qx.html.String.escape("\n"));

      this.assertEquals("Hello", qx.html.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.html.String.escape("juhu <>"));

      this.assertEquals("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;", qx.html.String.escape("<div id='1'>&nbsp; €</div>"));

      // textToHtml
      this.assertEquals("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp; &euro;&lt;/div&gt;", qx.html.String.fromText("<div id='1'>\n  &nbsp; €</div>"));

      // htmlToText
      this.assertEquals("<div id='1'>\n \u00A0&nbsp; €</div>", qx.html.String.toText("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp;  \n   &euro;&lt;/div&gt;"));

      // unescape HTML
      this.assertEquals("\n", qx.html.String.unescape("\n"));
      this.assertEquals("Hello", qx.html.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.html.String.unescape("juhu &lt;&gt;"));

      this.assertEquals("<div id='1'>&nbsp; €</div>", qx.html.String.unescape("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;"));

      this.assertEquals(">&zzzz;x", qx.html.String.unescape("&gt;&zzzz;x"));

      this.assertEquals("€", qx.html.String.unescape("&#x20AC;"));

      this.assertEquals("€", qx.html.String.unescape("&#X20AC;"));

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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testFunctionWrap : function()
    {
      var context = null;
      var result = 0;

      var add = function(a, b)
      {
        context = this;
        return a + b;
      };

      context = null;
      result = add(1, 2);
      this.assertEquals(context, window);
      this.assertEquals(3, result);

      context = null;
      var boundAdd = qx.lang.Function.bind(add, this);
      result = boundAdd(1, 3);
      this.assertEquals(context, this);
      this.assertEquals(4, result);

      context = null;
      var addOne = qx.lang.Function.bind(add, this, 1);
      result = addOne(4);
      this.assertEquals(context, this);
      this.assertEquals(5, result);
    }
  }
});
