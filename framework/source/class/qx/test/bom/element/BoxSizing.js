/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("qx.test.bom.element.BoxSizing",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.dev.unit.MRequirements],

  members :
  {
    __support :
    {
      mshtml : ["border-box", "content-box"],
      opera : ["border-box", "content-box"],
      gecko : ["border-box", "content-box"],
      webkit : ["border-box", "content-box"]
    },

    __el : null,

    setUp : function()
    {
      this.__el = document.createElement("div");
      document.body.appendChild(this.__el);
    },

    tearDown : function()
    {
      document.body.removeChild(this.__el);
      delete this.__el;
    },

    hasBoxsizing : function()
    {
      return !!qx.core.Environment.get("css.boxsizing");
    },

    testGet : function()
    {
      this.require(["boxsizing"]);

      var supported = this.__support[qx.core.Environment.get("engine.name")] || [];
      this.assertInArray(qx.bom.element.BoxSizing.get(this.__el), supported);
    },

    testSet : function()
    {
      this.require(["boxsizing"]);

      var allValues = this.__support["gecko"];
      var supported = this.__support[qx.core.Environment.get("engine.name")] || [];
      for (var i=0, l=allValues.length; i<l; i++) {
        qx.bom.element.BoxSizing.set(this.__el, allValues[i]);
        if (qx.lang.Array.contains(supported, allValues[i])) {
          this.assertEquals(supported[i], qx.bom.element.BoxSizing.get(this.__el),
            "supported boxSizing value was not applied!");
        }
        else {
          this.assertNotEquals(supported[i], qx.bom.element.BoxSizing.get(this.__el),
            "boxSizing value was unexpectedly applied, maybe browser support has changed?");
        }
      }
    },

    testCompile : function()
    {
      this.require(["boxsizing"]);

      var css = qx.bom.element.BoxSizing.compile("border-box");
      this.assertMatch(css, /box-sizing/);
    }
  }
});
