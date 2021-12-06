/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.layer.DomCell",
{
  extend : qx.ui.virtual.layer.Abstract,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _fullUpdate : function(firstRow, firstColumn, rowSizes, columnSizes)
    {
      var el = this.getContentElement().getDomElement();
      el.innerHTML = "";

      var Style = qx.bom.element.Style;
      var Attribute = qx.bom.element.Attribute;

      var left = 0;
      var top = 0;
      var row = firstRow;
      var col = firstColumn;

      var fragment = document.createDocumentFragment();

      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = firstColumn;
        for(var y=0; y<columnSizes.length; y++)
        {
          var content = col + " / " + row;
          var cell = document.createElement("div");
          Style.setCss(cell, [
            "position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", columnSizes[y], "px;",
            "height:", rowSizes[x], "px;"
          ].join(""));

          Attribute.set(cell, "text", content);
          left += columnSizes[y];
          fragment.appendChild(cell);
        }
        top += rowSizes[x];
        row++;
      }

      el.appendChild(fragment);
    }
  }
});
