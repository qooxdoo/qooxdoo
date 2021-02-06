/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qx/test/UnitTestFlash.swf)
 */

qx.Class.define("qx.test.html.Flash",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __flash : null,

    setUp : function() {
      this.__flash = new qx.html.Flash();
    },

    tearDown : function() {
      this.__flash.dispose();
      this.__flash = null;
    },

    testSetSource : function(value)
    {
      this.__flash.setSource("movieURL");
      this.assertIdentical("movieURL", this.__flash.getAttributes().movie);
    },

    testSetId : function(value)
    {
      this.__flash.setId("flashID");
      this.assertIdentical("flashID", this.__flash.getAttributes().id);
    },

    testSetVariables : function(value)
    {
      var map = {a: "valueA", b: "valueB"};

      this.__flash.setVariables(map);
      this.assertIdentical(map, this.__flash.getVariables());
    },

    testSetAttribute : function (key, value)
    {
      this.__flash.setAttribute("attrib1", "hoho");
      this.__flash.setAttribute("attrib2", "gogo");
      this.__flash.setAttribute("attrib3", true);
      this.__flash.setAttribute("attrib4", false);

      var map = this.__flash.getAttribute();
      this.assertIdentical("hoho", this.__flash.getAttributes().attrib1);
      this.assertIdentical("gogo", this.__flash.getAttributes().attrib2);
      this.assertTrue(this.__flash.getAttributes().attrib3);
      this.assertFalse(this.__flash.getAttributes().attrib4);

      this.__flash.setAttribute("attrib1");
      this.__flash.setAttribute("attrib3");
      this.assertUndefined(this.__flash.getAttributes().attrib1);
      this.assertIdentical("gogo", this.__flash.getAttributes().attrib2);
      this.assertUndefined(this.__flash.getAttributes().attrib3);
      this.assertFalse(this.__flash.getAttributes().attrib4);

      this.__flash.setAttribute("attrib2", null);
      this.__flash.setAttribute("attrib4", null);
      this.assertUndefined(this.__flash.getAttributes().attrib1);
      this.assertUndefined(this.__flash.getAttributes().attrib2);
      this.assertUndefined(this.__flash.getAttributes().attrib3);
      this.assertUndefined(this.__flash.getAttributes().attrib4);
    },

    testSetParam : function(key, value)
    {
      this.__flash.setParam("param1", "hoho");
      this.__flash.setParam("param2", "gogo");
      this.__flash.setParam("param3", true);
      this.__flash.setParam("param4", false);

      var map = this.__flash.getParams();
      this.assertIdentical("hoho", this.__flash.getParams().param1);
      this.assertIdentical("gogo", this.__flash.getParams().param2);
      this.assertTrue(this.__flash.getParams().param3);
      this.assertFalse(this.__flash.getParams().param4);

      this.__flash.setParam("param1");
      this.__flash.setParam("param3");
      this.assertUndefined(this.__flash.getParams().param1);
      this.assertIdentical("gogo", this.__flash.getParams().param2);
      this.assertUndefined(this.__flash.getParams().param3);
      this.assertFalse(this.__flash.getParams().param4);

      this.__flash.setParam("param2", null);
      this.__flash.setParam("param4", null);
      this.assertUndefined(this.__flash.getParams().param1);
      this.assertUndefined(this.__flash.getParams().param2);
      this.assertUndefined(this.__flash.getParams().param3);
      this.assertUndefined(this.__flash.getParams().param4);
    }
  }
});
