/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Table Cell Boolean Renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Boolean",
{
  extend     : qx.ui.progressive.renderer.table.cell.Icon,


  construct : function()
  {
    this.base(arguments);

    this._iconUrlTrue =
      qx.util.AliasManager.getInstance().resolve("widget/table/boolean-true.png");
    this._iconUrlFalse =
      qx.util.AliasManager.getInstance().resolve("widget/table/boolean-false.png");
    this._iconUrlNull =
      qx.util.AliasManager.getInstance().resolve("static/image/blank.gif");
  },


  properties :
  {
    /**
     * Whether to add code which will toggle the checkbox on/off.  (There is
     * not yet code here to generate an event when this occurs, so it's not
     * yet very useful.)
     */
    allowToggle :
    {
      init : false
    }
  },


  members :
  {
    // overridden
    _identifyImage : function(cellInfo)
    {
      var imageData =
      {
        imageWidth  : 11,
        imageHeight : 11
      };

      switch(cellInfo.cellData)
      {
        case true:
          imageData.url = this._iconUrlTrue;
          imageData.extras = "celldata='1'";
          break;

        case false:
          imageData.url = this._iconUrlFalse;
          imageData.extras = "celldata='0' ";
          break;

        default:
          imageData.url = this._iconUrlNull;
          break;
      }

      if (this.getAllowToggle())
      {
        // Toggle the boolean value if clicked
        imageData.extras +=
          "onclick=\"" +
          "var node = this.attributes.getNamedItem('celldata'); " +
          "var value = node.nodeValue; " +
          "if (value == '0') " +
          "{" +
          "  this.src='" + this._iconUrlTrue + "'; " +
          "  node.nodeValue='1'; " +
          "}" +
          "else " +
          "{" +
          "  this.src='" + this._iconUrlFalse + "'; " +
          "  node.nodeValue='0'; " +
          "}" +
        "this.attributes.setNamedItem(node); " +
          "\"";
      }

      return imageData;
    },

    // overridden
    _getCellStyle : function(cellInfo)
    {
      var ret =
        this.base(arguments, cellInfo) +
        "padding-top:4px;";
      return ret;
    }
  },

  destruct : function()
  {
    this._disposeFields("_iconUrlTrue",
                        "_iconUrlFalse",
                        "_iconUrlNull");
  }
});
