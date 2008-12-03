/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Tartan Solutions, Inc, http://www.tartansolutions.com
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dan Hummon
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Table Cell Boolean Renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Image",
{
  extend     : qx.ui.progressive.renderer.table.cell.Icon,


  /**
   * @param height {Integer ? 16}
   *   The height of the image. The default is 16.
   *
   * @param width {Integer ? 16}
   *   The width of the image. The default is 16.
   */
  construct : function(width, height)
  {
    this.base(arguments);

    if (width === undefined)
    {
      this._imageWidth = width;
    }
    else
    {
      this._imageWidth = 16;
    }

    if (height === undefined)
    {
      this._imageHeight = height;
    }
    else
    {
      this._imageHeight = 16;
    }

    this._am = qx.io.Alias.getInstance();
  },


  members :
  {
    // overridden
    _identifyImage : function(cellInfo)
    {
      var imageData =
      {
        imageWidth  : this._imageWidth,
        imageHeight : this._imageHeight
      };

      var height;

      // String data is the unresolved url for the image.
      // Object data is a map containing the url, tooltip, and a height
      if (typeof(cellInfo.cellData) == "string")
      {
        imageData.url = cellInfo.cellData;
      }
      else
      {
        imageData.url = cellInfo.cellData.url;
        imageData.tooltip = cellInfo.cellData.tooltip;
        height = cellInfo.cellData.height;
      }

      if (imageData.url == "")
      {
        imageData.url = this.IMG_BLANK_URL;
      }
      else
      {
        imageData.url = this._am.resolve(imageData.url);
      }

      // Adjust the row height, if necessary, to let this image fit
      if (height)
      {
        cellInfo.height = height;
      }

      return imageData;
    }
  },

  destruct : function()
  {
    this._disposeFields("_imageWidth",
                        "imageHeight");
  }
});
