/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Tartan Solutions, Inc, http://www.tartansolutions.com
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dan Hummon
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Table Cell Boolean Renderer.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Image", {
  extend: qx.ui.progressive.renderer.table.cell.Icon,

  /**
   * @param height {Integer ? 16}
   *   The height of the image. The default is 16.
   *
   * @param width {Integer ? 16}
   *   The width of the image. The default is 16.
   */
  construct(width, height) {
    super();

    if (width !== undefined) {
      this._imageWidth = width;
    } else {
      this._imageWidth = 16;
    }

    if (height !== undefined) {
      this._imageHeight = height;
    } else {
      this._imageHeight = 16;
    }
  },

  members: {
    _imageWidth: null,
    _imageHeight: null,

    _getDefaultImageData(cellInfo) {
      return {
        imageWidth: this._imageWidth,
        imageHeight: this._imageHeight
      };
    },

    // overridden
    _identifyImage(cellInfo) {
      var height;
      var imageData = this._getDefaultImageData(cellInfo);

      // String data is the unresolved url for the image.
      // Object data is a map containing the url, tooltip, and a height
      if (typeof cellInfo.cellData == "string") {
        imageData.url = cellInfo.cellData;
      } else {
        imageData.url = cellInfo.cellData.url;
        imageData.tooltip = cellInfo.cellData.tooltip;
        height = cellInfo.cellData.height;
      }

      if (imageData.url == "") {
        imageData.url = this._imageBlank;
      } else {
        var aliasManager = qx.util.AliasManager.getInstance();
        var resourceManager = qx.util.ResourceManager.getInstance();
        var resolved = aliasManager.resolve(imageData.url);
        imageData.url = resourceManager.toUri(resolved);
      }

      // Adjust the row height, if necessary, to let this image fit
      if (height) {
        cellInfo.height = height;
      }

      return imageData;
    }
  }
});
