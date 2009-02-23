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

      return {width : width, height : height};
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
      var content = "";
      var imageData = this.__createImage(value.source, value.width, value.height);
      var oldFireFox = qx.bom.client.Engine.GECKO && qx.bom.client.Engine.VERSION < 1.9;
      var tooltip = (value.tooltip) ? 'title="' + value.tooltip + '"' : "";

      var styles = {
        width: imageData.width + "px",
        height: imageData.height + "px",
        display: oldFireFox ? "-moz-inline-box" : "inline-block",
        verticalAlign: "top",
        position: "static"
      };

      var tag = qx.bom.element.Decoration.getTagName("no-repeat", imageData.url);
      var ret = qx.bom.element.Decoration.getAttributes(imageData.url, "no-repeat", styles);
      var css = qx.bom.element.Style.compile(ret.style);

      if (tag === "img")
      {
        content = '<img src="' + ret.src + '" style="' + css + '" ';
        content += tooltip + '/>';
      }
      else
      {
        content = '<div style="' + css + '" ';
        content += tooltip + '></div>';
      }



      return content;
    }

  }
});
