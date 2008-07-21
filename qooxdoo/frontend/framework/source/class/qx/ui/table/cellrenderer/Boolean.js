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

/**
 * A data cell renderer for boolean values.
 */
qx.Class.define("qx.ui.table.cellrenderer.Boolean",
{
  extend : qx.ui.table.cellrenderer.AbstractImage,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var aliasManager = qx.util.AliasManager.getInstance();
    var resourceManager = qx.util.ResourceManager;

    this._iconUrlTrue = resourceManager.toUri(aliasManager.resolve("decoration/table/boolean-true.png"));
    this._iconUrlFalse = resourceManager.toUri(aliasManager.resolve("decoration/table/boolean-false.png"));
    this._iconUrlNull = resourceManager.toUri("qx/static/image/blank.gif");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getCellStyle : function(cellInfo) {
      return this.base(arguments, cellInfo) + ";padding-top:4px;";
    },


    // overridden
    _identifyImage : function(cellInfo)
    {
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
