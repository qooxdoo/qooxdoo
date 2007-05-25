/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Tartan Solutions, Inc, http://www.tartansolutions.com

    License:
      LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

    Authors:
      * Dan Hummon

************************************************************************ */

/* ************************************************************************

#module(ui_table)
#embed(static/image/blank.gif)

************************************************************************ */

qx.Class.define("qx.ui.table.ImageDataCellRenderer",
{
  extend : qx.ui.table.cellrenderer.Icon,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * @param height {int} The height of the image. The default is 11.
   * @param width {int} The width of the image. The default is 11.
   */
  construct : function(width, height)
  {
    this.base(arguments);

    if (width) {
      this._imageWidth = width;
    } else {
      this._imageWidth = 16;
    }

    if (width) {
      this._imageHeight = height;
    } else {
      this._imageHeight = 16;
    }
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
      var IconDataCellRenderer = qx.ui.table.cellrenderer.Icon;

      var imageHints =
      {
        imageWidth  : this._imageWidth,
        imageHeight : this._imageHeight
      };

      var am = qx.io.Alias.getInstance();

      if (cellInfo.value == "") {
        imageHints.url = am.resolve("static/image/blank.gif");
      } else {
        imageHints.url = am.resolve(cellInfo.value);
      }

      return imageHints;
    }
  }
});
