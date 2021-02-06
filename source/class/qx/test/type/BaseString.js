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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * @ignore(qx.String)
 */

qx.Class.define("qx.test.type.BaseString",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testToString : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("Juhu", s);
    },


    testValueOf : function() {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("Juhu".valueOf(), s.valueOf());
    },


    testUpperCase : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("JUHU", s.toUpperCase());
    },


    testIndexOf : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals(1, s.indexOf("u"));
    },


    testPlusOperator : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("__Juhu__", ["__", s + "__"].join(""));
    },


    testCharAt : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("h", s.charAt(2));
    },


    testcharCodeAt : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals(104, s.charCodeAt(2));
    },


    testlastIndexOf : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals(3, s.lastIndexOf("u"));
    },


    testLength : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals(4, s.length);
    },


    testLowerCase : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("juhu", s.toLowerCase());
    },


    testSubstringOneArgument : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("hu", s.substring(2));
    },


    testSubstringTwoArguments : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("u", s.substring(2, 1));
    },


    testSearchString : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals(2, s.search("h"));
    },


    testSearchRegExp : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals(0, s.search(/J/));
    },


    testReplace : function()
    {
      var s = new qx.type.BaseString("Juhu");
      this.assertEquals("Johu", s.replace("u", "o"));
    },


    testEmptyString : function()
    {
      var s = new qx.type.BaseString();
      this.assertEquals("", s.toString());

      var s = new qx.type.BaseString("");
      this.assertEquals("", s.toString());
    },


    testExtend : function()
    {
      qx.Class.define("qx.String",
      {
        extend : qx.type.BaseString,

        members :
        {
          bold : function() {
            return "<b>" + this.toString() + "</b>";
          }
        }
      });

      var s = new qx.String("Juhu");
      this.assertEquals("<b>Juhu</b>", s.bold());
    }
  }
});
