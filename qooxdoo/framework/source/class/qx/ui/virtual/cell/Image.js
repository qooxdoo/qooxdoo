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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.virtual.cell.Image",
{
  //extend : qx.ui.virtual.cell.AbstractImage,
  extend : qx.ui.virtual.cell.Cell,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__defaultWidth = 16;
    this.__defaultHeight = 16;
    this.__aliasManager = qx.util.AliasManager.getInstance();
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance:
    {
      refine : true,
      init : "cell-image"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __defaultWidth : null,
    __defaultHeight : null,
    __aliasManager : null,

    // overridden
    _getCellClass : function(cellInfo) {
      return this.base(arguments) + " qooxdoo-table-cell-icon";
    },

    __getImageSize : function(source)
    {
      var ResourceManager = qx.util.ResourceManager;
      var ImageLoader = qx.io2.ImageLoader;
      var width, height;

      // Detect if the image registry knows this image
      if (ResourceManager.has(source))
      {
        width = ResourceManager.getImageWidth(source),
        height = ResourceManager.getImageHeight(source)
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

      return {widht : width, height : height};
    },

    __createImage : function(source, width, height)
    {

      var url = (source == "") ? null : this.__aliasManager.resolve(source);
      var sizes;
      
      if (width && height) {
        sizes = {width : width, height : height};
      } else {
        sizes = this.__getImageSize(url);
      }

      return {
        width : sizes.width,
        height : sizes.height,
        url : url
      };
    },


    getContent : function(value, states)
    {
      var imageData = this.__createImage(value.source, value.width, value.height);

      var content = qx.bom.element.Decoration.create(imageData.url, "no-repeat", {
        width: imageData.width + "px",
        height: imageData.height + "px",
        display: qx.bom.client.Engine.GECKO && qx.bom.client.Engine.VERSION < 1.9 ? "-moz-inline-box" : "inline-block",
        verticalAlign: "top",
        position: "static"
      });
      
      return content;
    }

  }
});
