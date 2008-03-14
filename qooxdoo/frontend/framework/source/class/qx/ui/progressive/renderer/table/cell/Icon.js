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
 * Table Cell Icon Renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Icon",
{
  type       : "abstract",
  extend     : qx.ui.progressive.renderer.table.cell.Abstract,


  /**
   */
  construct : function()
  {
    this.base(arguments);

    this.IMG_BLANK_URL =
      qx.io.Alias.getInstance().resolve("static/image/blank.gif");
  },


  members :
  {
    _identifyImage : function(cellInfo)
    {
      throw new Error("_identifyImage() is abstract");
    },

    _getImageData : function(cellInfo)
    {
      // Query the subclass about image and tooltip
      var imageData = this._identifyImage(cellInfo);

      // If subclass refuses to give map, construct it
      if (imageData == null || typeof imageData == "string")
      {
        imageData =
        {
          url     : imageData,
          tooltip : null
        };
      }

      // If subclass gave null as url, replace with url to empty image
      if (imageData.url == null)
      {
        imageData.url = this.IMG_BLANK_URL;
      }

      return imageData;
    },

    _getCellStyle : function(cellInfo)
    {
      var ret =
        this.base(arguments, cellInfo) +
        "text-align:center;" +
        "padding-top:1px;";
      return ret;
    },

    _getContentHtml : function(cellInfo)
    {
      return qx.html.String.escape(this._formatValue(cellInfo.cellData));
    },


    // overridden
    _getContentHtml : function(cellInfo)
    {
      var html = [ ];
      var imageData = this._getImageData(cellInfo);

      // Start the image tag
      html.push('<img ');

      // Add magic to make png images work in IE
      if (qx.core.Client.getInstance().isMshtml() &&
          /\.png$/i.test(imageData.url))
      {
        html.push('src="', this.IMG_BLANK_URL, '" style="filter:',
                  "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='",
                  imageData.url,
                  "',sizingMethod='scale')",
                  '" ');
      }
      else
      {
        html.push('src="', imageData.url, '" ');
      }

      // If image width is specified...
      if (imageData.imageWidth)
      {
        // ... then add it.
        html.push(" width='", imageData.imageWidth, "px'");
      }

      // If image height is specified...
      if (imageData.imageHeight)
      {
        // ... then add it.
        html.push(" height='", imageData.imageHeight, "px'");
      }

      // If a tooltip is specified...
      if (imageData.tooltip)
      {
        // ... then add it.
        html.push(" title='", imageData.tooltip, "'");
      }

      // If there are any extra parameters specified, add them now.
      if (imageData.extras)
      {
        html.push(imageData.extras);
      }

      // All done.
      html.push(">");

      // Give 'em what they came for
      return html.join("");
    }
  }
});
