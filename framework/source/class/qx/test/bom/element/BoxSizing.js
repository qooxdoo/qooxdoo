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

  members :
  {
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
    
    testGet : function()
    {
      var possibleVals = ["border-box", "content-box", "inherit", "margin-box", "padding-box"];
      this.assertInArray(qx.bom.element.BoxSizing.get(this.__el), possibleVals);
    }
  }
});
