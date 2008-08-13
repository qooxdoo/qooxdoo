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

    var aliasManager = qx.util.AliasManager.getInstance();
    var resourceManager = qx.util.ResourceManager;
    var boolTrueImg =
      aliasManager.resolve("decoration/table/boolean-true.png");
    var boolFalseImg =
      aliasManager.resolve("decoration/table/boolean-false.png");

    this.__iconUrlTrue = resourceManager.toUri(boolTrueImg);
    this.__iconUrlFalse = resourceManager.toUri(boolFalseImg);
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

    __iconUrlTrue : null,
    __iconUrlFalse : null,
    __numericAllowed : null,
    __conditions : null,
    __defaultTextAlign : null,
    __defaultColor : null,
    __defaultFontStyle : null,
    __defaultFontWeight : null,

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
          imageData.url = this.__iconUrlTrue;
          imageData.extras = "celldata='1'";
          break;

        case false:
          imageData.url = this.__iconUrlFalse;
          imageData.extras = "celldata='0' ";
          break;

        default:
          imageData.url = null;
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
          "  this.src='" + this.__iconUrlTrue + "'; " +
          "  node.nodeValue='1'; " +
          "}" +
          "else " +
          "{" +
          "  this.src='" + this.__iconUrlFalse + "'; " +
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
      var ret = this.base(arguments, cellInfo);
      return ret;
    }
  },

  destruct : function()
  {
    this._disposeFields("__iconUrlTrue",
                        "__iconUrlFalse");
  }
});
