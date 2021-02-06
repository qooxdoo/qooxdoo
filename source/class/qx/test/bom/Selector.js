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

qx.Class.define("qx.test.bom.Selector",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testElementClass : function()
    {
      var Element = qx.dom.Element;

      var elements = [];

      for (var i=0; i<250; i++)
      {
        var el = Element.create("ul", {
          "class": "fromcode",
          "html": "<li>one</li><li>two</li><li>three</li>",
          "id": "setid"+ i
        });

        document.body.appendChild(el);
        elements.push(el);
      }

      this.assertEquals(250, qx.bom.Selector.query("ul.fromcode", document.body).length);
      this.assertEquals(750, qx.bom.Selector.query("ul > li").length);

      elements.forEach(function(el) {
        document.body.removeChild(el);
      })
    }
  }
});
