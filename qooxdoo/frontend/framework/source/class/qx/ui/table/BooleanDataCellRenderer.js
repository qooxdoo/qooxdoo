/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

/* ************************************************************************

#module(ui_table)
#embed(qx.widgettheme/table/boolean-true.png)
#embed(qx.widgettheme/table/boolean-false.png)
#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.Class.define("qx.ui.table.BooleanDataCellRenderer",
{
  extend : qx.ui.table.IconDataCellRenderer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._iconUrlTrue = qx.manager.object.AliasManager.getInstance().resolve("widget/table/boolean-true.png");
    this._iconUrlFalse = qx.manager.object.AliasManager.getInstance().resolve("widget/table/boolean-false.png");
    this._iconUrlNull = qx.manager.object.AliasManager.getInstance().resolve("static/image/blank.gif");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {var} TODOC
     */
    _identifyImage : function(cellInfo)
    {
      var IconDataCellRenderer = qx.ui.table.IconDataCellRenderer;

      var imageHints =
      {
        imageWidth  : 11,
        imageHeight : 11
      };

      switch(cellInfo.value)
      {
        case true:
          imageHints.url = this._iconUrlTrue;
          break;

        case false:
          imageHints.url = this._iconUrlFalse;
          break;

        default:
          imageHints.url = this._iconUrlNull;
          break;
      }

      return imageHints;
    }
  }
});
