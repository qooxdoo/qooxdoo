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
     * Gabriel Munteanu (gabios)

************************************************************************ */

qx.Class.define("qx.test.bom.Dataset",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      var div = document.createElement("div");
      div.id = "el";

      this._el = div;
      document.body.appendChild(div);
    },


    tearDown : function() {
      document.body.removeChild(this._el);
    },


    testSetAttribute : function()
    {
      var Dataset = qx.bom.element.Dataset;

      Dataset.set(this._el, "maxAge", "100");
      this.assertEquals("100", Dataset.get(this._el,"maxAge"));
      this.assertEquals("100", this._el.getAttribute("data-max-age"));

    },

    testSetAttributeWithUndefinedValue : function()
    {
      var Dataset = qx.bom.element.Dataset;

      Dataset.set(this._el, "age", undefined);
      this.assertNotEquals("undefined", this._el.getAttribute("data-age"));
    },

    testGetAttribute : function()
    {
      var Dataset = qx.bom.element.Dataset;

      this.assertNull(Dataset.get(this._el, "salary"));

      this._el.setAttribute("data-salary", "20");
      this.assertEquals("20", Dataset.get(this._el, "salary"));
    },

    testRemoveAttribute : function()
    {
      var Dataset = qx.bom.element.Dataset;

      Dataset.set(this._el, "age", "44");
      Dataset.remove(this._el, "age");
      this.assertNull(this._el.getAttribute("age"));
      this.assertNull(Dataset.get(this._el, "age"));
    }
  }
});