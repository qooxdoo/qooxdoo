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
 * A template class for cell renderer, which display images. Concrete
 * implementations must implement the method @{link #_identifyImage}.
 */
qx.Class.define("qx.ui.table.cellrenderer.AbstractImage",
{
  extend : qx.ui.table.cellrenderer.Abstract,
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var clazz = this.self(arguments);
    if (!clazz.stylesheet)
    {
      clazz.stylesheet = qx.bom.Stylesheet.createElement(
        ".qooxdoo-table-cell-icon {" +
        "  text-align:center;" +
        "  padding-top:1px;" +
        "}"
      );
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __defaultWidth : 16,
    __defaultHeight : 16,
    _insetY : 2,
    __imageData : null,

    /**
     * Identifies the Image to show. This is a template method, which must be
     * implements by sub classes.
     *
     * @abstract
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {Map} A map having the following attributes:
     *           <ul>
     *           <li>"url": (type string) must be the URL of the image to show.</li>
     *           <li>"imageWidth": (type int) the width of the image in pixels.</li>
     *           <li>"imageHeight": (type int) the height of the image in pixels.</li>
     *           <li>"tooltip": (type string) must be the image tooltip text.</li>
     *           </ul>
     * @throws the abstract function warning.
     */
    _identifyImage : function(cellInfo) {
      throw new Error("_identifyImage is abstract");
    },


    /**
     * Retrieves the image infos.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {Map} Map with an "url" attribute (type string)
     *                 holding the URL of the image to show
     *                 and a "tooltip" attribute
     *                 (type string) being the tooltip text (or null if none was specified)
     */
    _getImageInfos : function(cellInfo)
    {
      // Query the subclass about image and tooltip
      var imageData = this._identifyImage(cellInfo);

      // If subclass refuses to give map, construct it
      if (imageData == null || typeof cellInfo == "string")
      {
        imageData =
        {
          url : imageData,
          tooltip : null
        };
      }

      if (cellInfo.width && cellInfo.height) {
        var sizes = {width : cellInfo.imageWidth, height : cellInfo.imageHeight};
      } else {
        sizes = this.__getImageSize(imageData.url);
      }
      imageData.width = sizes.width;
      imageData.height = sizes.height;

      return imageData;
    },


    /**
     * Compute the size of the given image
     *
     * @param source {String} the image URL
     * @return {Map} A map containing the image's <code>width</code> and
     *    <code>height</code>
     */
    __getImageSize : function(source)
    {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      var ImageLoader = qx.io.ImageLoader;
      var width, height;

      // Detect if the image registry knows this image
      if (ResourceManager.has(source))
      {
        width = ResourceManager.getImageWidth(source);
        height = ResourceManager.getImageHeight(source);
      }
      else if (ImageLoader.isLoaded(source))
      {
        width = ImageLoader.getWidth(source);
        height = ImageLoader.getHeight(source);
      }
      else
      {
        width = this.__defaultWidth;
        height = this.__defaultHeight;
      }

      return {width : width, height : height};
    },


    // overridden
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      this.__imageData = this._getImageInfos(cellInfo);
      return this.base(arguments, cellInfo, htmlArr);
    },


    // overridden
    _getCellClass : function(cellInfo) {
      return this.base(arguments) + " qooxdoo-table-cell-icon";
    },


    // overridden
    _getContentHtml : function(cellInfo)
    {
      var content = "<div></div>";

      // set image
      if (this.__imageData.url) {
        var content = qx.bom.element.Decoration.create(this.__imageData.url, "no-repeat", {
          width: this.__imageData.width + "px",
          height: this.__imageData.height + "px",
          display: qx.bom.client.Engine.GECKO && qx.bom.client.Engine.VERSION < 1.9 ? "-moz-inline-box" : "inline-block",
          verticalAlign: "top",
          position: "static"
        });
      };

      return content;
    },


    // overridden
    _getCellAttributes : function(cellInfo)
    {
      var tooltip = this.__imageData.tooltip;

      if (tooltip) {
        return "title='" + tooltip + "'";
      } else {
        return "";
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__imageData = null;
  }
});
