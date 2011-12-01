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
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.element.Style",
{
  extend : qx.dev.unit.TestCase,
  include : [ qx.dev.unit.MRequirements ],

  members :
  {
    hasCssBoxshadow : function()
    {
      return qx.core.Environment.get("css.boxshadow") !== null;
    },

    setUp : function()
    {
      this.__element = document.createElement("div");
      document.body.appendChild(this.__element);
    },


    tearDown : function()
    {
      document.body.removeChild(this.__element);
      this.__element = null;
    },


    testSetStylesWithCss3 : function()
    {
      //if (this.require(["css.boxshadow"]))
      if (this.require(["cssBoxshadow"]))
      {
        var styles =
        {
          "MozBoxShadow" : "6px 6px 10px rgb(128, 128, 128)",
          "WebkitBoxShadow" : "6px 6px 10px rgb(128, 128, 128)",
          "boxShadow" : "6px 6px 10px rgb(128, 128, 128)"
        };

        qx.bom.element.Style.setStyles(this.__element, styles);

        var expected = qx.core.Environment.select("engine.name",
        {
          "webkit" : "rgb(128, 128, 128) 6px 6px 10px",
          "mshtml" : "6px 6px 10px rgb(128,128,128)",
          "default" : "6px 6px 10px rgb(128, 128, 128)"
        });

        this.assertEquals(expected, this.__element.style["boxShadow"]);
      }
    },


    testSetAndGetCss : function()
    {
      var css = "font-weight: bold;";
      qx.bom.element.Style.setCss(this.__element, css);
      this.assertMatch(qx.bom.element.Style.getCss(this.__element), /font-weight.*?bold/i);
    }
  }
});